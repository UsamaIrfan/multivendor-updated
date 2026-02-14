import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FeeStructureRepository } from '../lms/student/infrastructure/persistence/fee-structure.repository';
import { FeeChallanRepository } from '../lms/student/infrastructure/persistence/fee-challan.repository';
import { FeePaymentRepository } from '../lms/student/infrastructure/persistence/fee-payment.repository';
import { ConcessionRepository } from './infrastructure/persistence/concession.repository';
import { ReceiptRepository } from './infrastructure/persistence/receipt.repository';
import { StudentRepository } from '../lms/student/infrastructure/persistence/student.repository';
import { StudentEnrollmentRepository } from '../lms/student/infrastructure/persistence/student-enrollment.repository';
import { ChallanGeneratorService } from './challan-generator.service';
import { FeeCalculatorService } from './fee-calculator.service';
import { MailService } from '../mail/mail.service';
import {
  PaymentStatusEnum,
  PaymentMethodEnum,
} from '../lms/common/enums/payment-status.enum';

// ── Interfaces for method params ──

interface CreateFeeStructureParams {
  institutionId: number;
  gradeClassId?: number | null;
  academicYearId?: number | null;
  name: string;
  amount: number;
  frequency?: string;
  description?: string | null;
  installments?: Array<{ label: string; amount: number; dueDate: string }>;
}

interface GenerateChallanParams {
  studentId: number;
  feeStructureId: number;
  installmentIndex?: number;
  dueDate: string;
}

interface RecordPaymentParams {
  challanId: number;
  amount: number;
  method?: PaymentMethodEnum | string;
  transactionRef?: string | null;
  paidAt?: string | null;
  remarks?: string | null;
}

interface ApplyConcessionParams {
  studentId: number;
  type: string;
  discountPercentage: number;
  validFrom: string;
  validTo: string;
  reason?: string;
}

interface SendRemindersParams {
  gradeClassId?: number;
  overdueBefore?: string;
}

const REMINDER_THROTTLE_HOURS = 24;

@Injectable()
export class FeesService {
  constructor(
    private readonly feeStructureRepo: FeeStructureRepository,
    private readonly feeChallanRepo: FeeChallanRepository,
    private readonly feePaymentRepo: FeePaymentRepository,
    private readonly concessionRepo: ConcessionRepository,
    private readonly receiptRepo: ReceiptRepository,
    private readonly studentRepo: StudentRepository,
    private readonly enrollmentRepo: StudentEnrollmentRepository,
    private readonly challanGenerator: ChallanGeneratorService,
    private readonly feeCalculator: FeeCalculatorService,
    private readonly mailService: MailService,
  ) {}

  // ────────── Fee Structure ──────────

  async createFeeStructure(dto: CreateFeeStructureParams) {
    // Validate installments sum
    if (dto.installments && dto.installments.length > 0) {
      const installmentSum = dto.installments.reduce(
        (sum, i) => sum + i.amount,
        0,
      );
      if (Math.abs(installmentSum - dto.amount) > 0.01) {
        throw new UnprocessableEntityException({
          status: 422,
          errors: {
            installments: `Installments sum (${installmentSum}) does not equal total amount (${dto.amount})`,
          },
        });
      }
    }

    // Check for duplicates
    const existing = await this.feeStructureRepo.findAll();
    const duplicate = existing.find(
      (fs) =>
        fs.institutionId === dto.institutionId &&
        fs.gradeClassId === (dto.gradeClassId ?? null) &&
        fs.academicYearId === (dto.academicYearId ?? null) &&
        fs.name === dto.name,
    );
    if (duplicate) {
      throw new ConflictException(
        'Fee structure already exists for this class/year/name combination',
      );
    }

    const structure = await this.feeStructureRepo.create({
      institutionId: dto.institutionId,
      gradeClassId: dto.gradeClassId ?? null,
      academicYearId: dto.academicYearId ?? null,
      name: dto.name,
      amount: dto.amount,
      frequency: dto.frequency as any,
      description: dto.description ?? null,
    });

    return {
      ...structure,
      installments: dto.installments ?? [],
    };
  }

  async getFeeStructure(id: number) {
    const structure = await this.feeStructureRepo.findById(id);
    if (!structure) {
      throw new NotFoundException('Fee structure not found');
    }
    return structure;
  }

  // ────────── Challan Generation ──────────

  async generateChallan(dto: GenerateChallanParams) {
    const student = await this.studentRepo.findById(dto.studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const structure = await this.feeStructureRepo.findById(dto.feeStructureId);
    if (!structure) {
      throw new NotFoundException('Fee structure not found');
    }

    // Check for duplicate challan for same installment
    const existing =
      await this.feeChallanRepo.findByStudentAndStructureAndInstallment(
        dto.studentId,
        dto.feeStructureId,
        dto.installmentIndex ?? 0,
      );
    if (existing) {
      throw new ConflictException(
        'Challan already exists for this student/structure/installment',
      );
    }

    // Calculate amount (with installment support)
    let amount = structure.amount;
    if (
      (structure as any).installments &&
      dto.installmentIndex !== undefined &&
      (structure as any).installments[dto.installmentIndex]
    ) {
      amount = (structure as any).installments[dto.installmentIndex].amount;
    }

    // Apply concession
    const concessions = await this.concessionRepo.findActiveByStudentId(
      dto.studentId,
    );
    const effectiveDiscount =
      this.feeCalculator.calculateEffectiveDiscount(concessions);
    const discountAmount =
      effectiveDiscount > 0
        ? amount - this.feeCalculator.applyDiscount(amount, effectiveDiscount)
        : 0;
    const finalAmount =
      effectiveDiscount > 0
        ? this.feeCalculator.applyDiscount(amount, effectiveDiscount)
        : amount;

    const challanNumber = await this.challanGenerator.generate();

    const challan = await this.feeChallanRepo.create({
      studentId: dto.studentId,
      feeStructureId: dto.feeStructureId,
      challanNumber,
      totalAmount: finalAmount,
      paidAmount: 0,
      discount: discountAmount,
      dueDate: new Date(dto.dueDate),
      issueDate: new Date(),
      status: PaymentStatusEnum.pending,
      remarks:
        dto.installmentIndex !== undefined
          ? `Installment #${dto.installmentIndex}`
          : null,
    });

    return challan;
  }

  async generateBulkChallans(dto: {
    gradeClassId: number;
    feeStructureId: number;
    installmentIndex?: number;
    dueDate: string;
  }) {
    // Get all enrolled students for the class
    // Section → gradeClass mapping: enrollment has sectionId, section has gradeClassId
    const allEnrollments = await this.enrollmentRepo.findAll();
    const enrollments = allEnrollments.filter(
      (e: any) =>
        (e as any).gradeClassId === dto.gradeClassId ||
        (e as any).section?.gradeClassId === dto.gradeClassId,
    );

    let generated = 0;
    let skipped = 0;

    for (const enrollment of enrollments) {
      const studentId = enrollment.studentId;
      if (!studentId) {
        skipped++;
        continue;
      }

      try {
        await this.generateChallan({
          studentId,
          feeStructureId: dto.feeStructureId,
          installmentIndex: dto.installmentIndex,
          dueDate: dto.dueDate,
        });
        generated++;
      } catch (error) {
        // Skip if already exists (ConflictException)
        if (error instanceof ConflictException) {
          skipped++;
        } else {
          throw error;
        }
      }
    }

    return { generated, skipped, total: enrollments.length };
  }

  async getChallanByNumber(challanNumber: string) {
    const challan =
      await this.feeChallanRepo.findByChallanNumber(challanNumber);
    if (!challan) {
      throw new NotFoundException('Challan not found');
    }
    return challan;
  }

  // ────────── Payment Recording ──────────

  async recordPayment(dto: RecordPaymentParams) {
    const challan = await this.feeChallanRepo.findById(dto.challanId);
    if (!challan) {
      throw new NotFoundException('Challan not found');
    }

    const remaining = Number(challan.totalAmount) - Number(challan.paidAmount);
    if (remaining <= 0) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          amount: 'Challan is already fully paid',
        },
      });
    }

    if (dto.amount > remaining) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          amount: `Payment amount (${dto.amount}) exceeds remaining (${remaining})`,
        },
      });
    }

    // Generate receipt number
    const receiptNumber = await this.receiptRepo.getNextReceiptNumber();

    // Create payment
    const payment = await this.feePaymentRepo.create({
      feeChallanId: dto.challanId,
      amount: dto.amount,
      method: (dto.method as PaymentMethodEnum) ?? PaymentMethodEnum.cash,
      transactionRef: dto.transactionRef ?? null,
      receiptNumber,
      paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
      remarks: dto.remarks ?? null,
    });

    // Update challan
    const newPaidAmount = Number(challan.paidAmount) + dto.amount;
    const newStatus =
      newPaidAmount >= Number(challan.totalAmount)
        ? PaymentStatusEnum.paid
        : PaymentStatusEnum.partial;

    await this.feeChallanRepo.update(dto.challanId, {
      paidAmount: newPaidAmount,
      status: newStatus,
    });

    // Create receipt record
    const receipt = await this.receiptRepo.create({
      paymentId: payment.id,
      receiptNumber,
      amount: dto.amount,
      studentName: null,
      challanNumber: challan.challanNumber,
      paymentMethod: dto.method ?? PaymentMethodEnum.cash,
      issuedAt: new Date(),
    });

    return {
      ...payment,
      receiptNumber,
      receiptId: receipt?.id ?? null,
      verified: false,
    };
  }

  async verifyPayment(paymentId: number) {
    const payment = await this.feePaymentRepo.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Mark as verified by updating remarks or a flag
    const updated = await this.feePaymentRepo.update(paymentId, {
      remarks: payment.remarks ? `${payment.remarks} [VERIFIED]` : '[VERIFIED]',
    });

    return { ...updated, verified: true };
  }

  // ────────── Concessions ──────────

  async applyConcession(dto: ApplyConcessionParams) {
    const student = await this.studentRepo.findById(dto.studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (dto.discountPercentage < 0 || dto.discountPercentage > 100) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          discountPercentage: 'Discount must be between 0 and 100',
        },
      });
    }

    const validFrom = new Date(dto.validFrom);
    const validTo = new Date(dto.validTo);
    if (validFrom > validTo) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          validFrom: 'validFrom must be before validTo',
        },
      });
    }

    const concession = await this.concessionRepo.create({
      studentId: dto.studentId,
      type: dto.type as any,
      discountPercentage: dto.discountPercentage,
      validFrom,
      validTo,
      reason: dto.reason ?? null,
      approved: true,
      approvedBy: null,
    });

    return concession;
  }

  async getEffectiveConcession(studentId: number) {
    const concessions =
      await this.concessionRepo.findActiveByStudentId(studentId);
    const effectiveDiscount =
      this.feeCalculator.calculateEffectiveDiscount(concessions);

    return {
      studentId,
      effectiveDiscount,
      activeConcessions: concessions,
    };
  }

  // ────────── Receipts ──────────

  async getReceiptPdf(receiptId: number): Promise<Buffer> {
    const receipt = await this.receiptRepo.findById(receiptId);
    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    // Generate simple PDF content
    const content = [
      '='.repeat(50),
      '          PAYMENT RECEIPT',
      '='.repeat(50),
      '',
      `Receipt No:    ${receipt.receiptNumber}`,
      `Date:          ${receipt.issuedAt.toISOString().split('T')[0]}`,
      `Challan No:    ${receipt.challanNumber ?? 'N/A'}`,
      `Student:       ${receipt.studentName ?? 'N/A'}`,
      `Amount:        ${receipt.amount}`,
      `Payment Mode:  ${receipt.paymentMethod ?? 'N/A'}`,
      '',
      '='.repeat(50),
      '  This is a computer-generated receipt.',
      '='.repeat(50),
    ].join('\n');

    return Buffer.from(content, 'utf-8');
  }

  // ────────── Reports ──────────

  async getCollectionReport(params: {
    dateFrom?: string;
    dateTo?: string;
    gradeClassId?: number;
  }) {
    const allPayments = await this.feePaymentRepo.findAll();

    const filtered = allPayments.filter((p) => {
      if (
        params.dateFrom &&
        p.paidAt &&
        new Date(p.paidAt) < new Date(params.dateFrom)
      ) {
        return false;
      }
      if (
        params.dateTo &&
        p.paidAt &&
        new Date(p.paidAt) > new Date(params.dateTo)
      ) {
        return false;
      }
      return true;
    });

    const totalCollected = filtered.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    // Payment mode breakdown
    const byPaymentMode: Record<string, number> = {};
    for (const p of filtered) {
      const mode = p.method ?? 'unknown';
      byPaymentMode[mode] = (byPaymentMode[mode] ?? 0) + Number(p.amount);
    }

    return {
      totalCollected,
      transactionCount: filtered.length,
      byPaymentMode,
      byClass: {},
      dateFrom: params.dateFrom ?? null,
      dateTo: params.dateTo ?? null,
    };
  }

  async getPendingReport() {
    const allChallans = await this.feeChallanRepo.findAll();
    const pending = allChallans.filter(
      (c) =>
        c.status === PaymentStatusEnum.pending ||
        c.status === PaymentStatusEnum.partial ||
        c.status === PaymentStatusEnum.overdue,
    );

    const totalPending = pending.reduce(
      (sum, c) => sum + (Number(c.totalAmount) - Number(c.paidAmount)),
      0,
    );

    return {
      totalPending,
      count: pending.length,
      students: pending.map((c) => ({
        studentId: c.studentId,
        challanNumber: c.challanNumber,
        totalAmount: c.totalAmount,
        paidAmount: c.paidAmount,
        remaining: Number(c.totalAmount) - Number(c.paidAmount),
        dueDate: c.dueDate,
        status: c.status,
      })),
    };
  }

  async getDefaultersReport() {
    const allChallans = await this.feeChallanRepo.findAll();
    const now = new Date();

    const overdue = allChallans
      .filter(
        (c) =>
          (c.status === PaymentStatusEnum.pending ||
            c.status === PaymentStatusEnum.partial) &&
          new Date(c.dueDate) < now,
      )
      .map((c) => {
        const daysOverdue = Math.floor(
          (now.getTime() - new Date(c.dueDate).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return {
          studentId: c.studentId,
          challanNumber: c.challanNumber,
          amountDue: Number(c.totalAmount) - Number(c.paidAmount),
          dueDate: c.dueDate,
          daysOverdue,
        };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue);

    return overdue;
  }

  // ────────── Pending Amount ──────────

  async calculatePendingAmount(studentId: number): Promise<number> {
    const challans = await this.feeChallanRepo.findByStudentId(studentId);

    return challans
      .filter(
        (c: any) =>
          c.status !== PaymentStatusEnum.paid &&
          c.status !== PaymentStatusEnum.waived,
      )
      .reduce(
        (sum: number, c: any) =>
          sum + (Number(c.totalAmount) - Number(c.paidAmount)),
        0,
      );
  }

  // ────────── Reminders ──────────

  async sendPaymentReminders(dto: SendRemindersParams) {
    let pendingChallans: any[] = [];

    if (dto.gradeClassId) {
      pendingChallans = await this.feeChallanRepo.findPendingByClassId(
        dto.gradeClassId,
      );
    } else {
      const all = await this.feeChallanRepo.findAll();
      pendingChallans = all.filter(
        (c) =>
          c.status === PaymentStatusEnum.pending ||
          c.status === PaymentStatusEnum.partial,
      );
    }

    let sent = 0;
    let skipped = 0;

    for (const challan of pendingChallans) {
      // Check throttling
      if (challan.lastReminderSentAt) {
        const hoursSince =
          (Date.now() - new Date(challan.lastReminderSentAt).getTime()) /
          (1000 * 60 * 60);
        if (hoursSince < REMINDER_THROTTLE_HOURS) {
          skipped++;
          continue;
        }
      }

      try {
        if ('sendPaymentReminder' in this.mailService) {
          await (this.mailService as any).sendPaymentReminder({
            to: challan.student?.user?.email ?? '',
            data: {
              challanNumber: challan.challanNumber,
              amount:
                Number(challan.totalAmount) - Number(challan.paidAmount ?? 0),
              dueDate: challan.dueDate,
            },
          });
        }
        sent++;
      } catch {
        skipped++;
      }
    }

    return { sent, skipped, total: pendingChallans.length };
  }

  // ────────── Student Portal ──────────

  async getStudentChallans(studentId: number) {
    const challans = await this.feeChallanRepo.findByStudentId(studentId);

    // Attach payments to each challan
    const result: any[] = [];
    for (const challan of challans) {
      const payments = await this.feePaymentRepo.findByChallanId(challan.id);
      result.push({ ...challan, payments });
    }

    return result;
  }
}
