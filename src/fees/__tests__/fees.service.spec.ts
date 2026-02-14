import { Test, TestingModule } from '@nestjs/testing';
import { FeesService } from '../fees.service';
import { FeeStructureRepository } from '../../lms/student/infrastructure/persistence/fee-structure.repository';
import { FeeChallanRepository } from '../../lms/student/infrastructure/persistence/fee-challan.repository';
import { FeePaymentRepository } from '../../lms/student/infrastructure/persistence/fee-payment.repository';
import { ConcessionRepository } from '../infrastructure/persistence/concession.repository';
import { ReceiptRepository } from '../infrastructure/persistence/receipt.repository';
import { StudentRepository } from '../../lms/student/infrastructure/persistence/student.repository';
import { StudentEnrollmentRepository } from '../../lms/student/infrastructure/persistence/student-enrollment.repository';
import { ChallanGeneratorService } from '../challan-generator.service';
import { FeeCalculatorService } from '../fee-calculator.service';
import { MailService } from '../../mail/mail.service';
import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  PaymentStatusEnum,
  PaymentMethodEnum,
  FeeFrequencyEnum,
} from '../../lms/common/enums/payment-status.enum';

function createMockRepository() {
  return {
    create: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

describe('FeesService', () => {
  let service: FeesService;
  let feeStructureRepo: ReturnType<typeof createMockRepository>;
  let feeChallanRepo: ReturnType<typeof createMockRepository> & {
    findByChallanNumber: jest.Mock;
    findByStudentId: jest.Mock;
    findByStudentAndStructureAndInstallment: jest.Mock;
    findPendingByClassId: jest.Mock;
  };
  let feePaymentRepo: ReturnType<typeof createMockRepository> & {
    findByChallanId: jest.Mock;
  };
  let concessionRepo: ReturnType<typeof createMockRepository> & {
    findActiveByStudentId: jest.Mock;
  };
  let receiptRepo: ReturnType<typeof createMockRepository> & {
    getNextReceiptNumber: jest.Mock;
  };
  let studentRepo: ReturnType<typeof createMockRepository>;
  let enrollmentRepo: ReturnType<typeof createMockRepository> & {
    findByClassId: jest.Mock;
  };
  let challanGenerator: { generate: jest.Mock };
  let feeCalculator: {
    calculateEffectiveDiscount: jest.Mock;
    applyDiscount: jest.Mock;
  };
  let mailService: { sendPaymentReminder: jest.Mock };

  beforeEach(async () => {
    feeStructureRepo = createMockRepository();
    feeChallanRepo = {
      ...createMockRepository(),
      findByChallanNumber: jest.fn(),
      findByStudentId: jest.fn().mockResolvedValue([]),
      findByStudentAndStructureAndInstallment: jest
        .fn()
        .mockResolvedValue(null),
      findPendingByClassId: jest.fn().mockResolvedValue([]),
    };
    feePaymentRepo = {
      ...createMockRepository(),
      findByChallanId: jest.fn().mockResolvedValue([]),
    };
    concessionRepo = {
      ...createMockRepository(),
      findActiveByStudentId: jest.fn().mockResolvedValue([]),
    };
    receiptRepo = {
      ...createMockRepository(),
      getNextReceiptNumber: jest.fn().mockResolvedValue('REC-2026-000001'),
    };
    studentRepo = createMockRepository();
    enrollmentRepo = {
      ...createMockRepository(),
      findByClassId: jest.fn().mockResolvedValue([]),
    };
    challanGenerator = {
      generate: jest.fn().mockResolvedValue('CH-2026-000001'),
    };
    feeCalculator = {
      calculateEffectiveDiscount: jest.fn().mockReturnValue(0),
      applyDiscount: jest
        .fn()
        .mockImplementation(
          (amount: number, discount: number) =>
            Math.round(amount * (1 - discount / 100) * 100) / 100,
        ),
    };
    mailService = {
      sendPaymentReminder: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeesService,
        { provide: FeeStructureRepository, useValue: feeStructureRepo },
        { provide: FeeChallanRepository, useValue: feeChallanRepo },
        { provide: FeePaymentRepository, useValue: feePaymentRepo },
        { provide: ConcessionRepository, useValue: concessionRepo },
        { provide: ReceiptRepository, useValue: receiptRepo },
        { provide: StudentRepository, useValue: studentRepo },
        { provide: StudentEnrollmentRepository, useValue: enrollmentRepo },
        { provide: ChallanGeneratorService, useValue: challanGenerator },
        { provide: FeeCalculatorService, useValue: feeCalculator },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<FeesService>(FeesService);
  });

  // ────────── createFeeStructure ──────────
  describe('createFeeStructure', () => {
    it('should create a fee structure successfully', async () => {
      const dto = {
        institutionId: 1,
        gradeClassId: 1,
        academicYearId: 1,
        name: 'Tuition Fee',
        amount: 50000,
        frequency: FeeFrequencyEnum.annual,
        installments: [
          { label: 'Q1', amount: 12500, dueDate: '2026-04-15' },
          { label: 'Q2', amount: 12500, dueDate: '2026-07-15' },
          { label: 'Q3', amount: 12500, dueDate: '2026-10-15' },
          { label: 'Q4', amount: 12500, dueDate: '2027-01-15' },
        ],
      };
      feeStructureRepo.create.mockResolvedValue({ id: 1, ...dto });

      const result = await service.createFeeStructure(dto);
      expect(result).toHaveProperty('id');
      expect(feeStructureRepo.create).toHaveBeenCalledTimes(1);
    });

    it('should reject when installments sum does not equal total amount', async () => {
      const dto = {
        institutionId: 1,
        gradeClassId: 1,
        academicYearId: 1,
        name: 'Bad Fee',
        amount: 50000,
        frequency: FeeFrequencyEnum.annual,
        installments: [
          { label: 'Q1', amount: 10000, dueDate: '2026-04-15' },
          { label: 'Q2', amount: 10000, dueDate: '2026-07-15' },
        ],
      };

      await expect(service.createFeeStructure(dto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should reject duplicate fee structure', async () => {
      feeStructureRepo.findAll.mockResolvedValue([
        {
          id: 1,
          institutionId: 1,
          gradeClassId: 1,
          academicYearId: 1,
          name: 'Tuition Fee',
        },
      ]);
      const dto = {
        institutionId: 1,
        gradeClassId: 1,
        academicYearId: 1,
        name: 'Tuition Fee',
        amount: 50000,
        frequency: FeeFrequencyEnum.annual,
      };

      await expect(service.createFeeStructure(dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ────────── generateChallan ──────────
  describe('generateChallan', () => {
    it('should generate a challan with unique number', async () => {
      feeStructureRepo.findById.mockResolvedValue({
        id: 1,
        amount: 50000,
        installments: [{ label: 'Q1', amount: 12500, dueDate: '2026-04-15' }],
      });
      studentRepo.findById.mockResolvedValue({ id: 1 });
      feeChallanRepo.create.mockResolvedValue({
        id: 1,
        challanNumber: 'CH-2026-000001',
        totalAmount: 12500,
        status: PaymentStatusEnum.pending,
      });

      const result = await service.generateChallan({
        studentId: 1,
        feeStructureId: 1,
        installmentIndex: 0,
        dueDate: '2026-04-15',
      });

      expect(result.challanNumber).toBe('CH-2026-000001');
      expect(challanGenerator.generate).toHaveBeenCalled();
    });

    it('should apply concession discount', async () => {
      feeStructureRepo.findById.mockResolvedValue({
        id: 1,
        amount: 50000,
        installments: [{ label: 'Q1', amount: 10000, dueDate: '2026-04-15' }],
      });
      studentRepo.findById.mockResolvedValue({ id: 1 });
      feeCalculator.calculateEffectiveDiscount.mockReturnValue(25);
      feeChallanRepo.create.mockImplementation((data: any) =>
        Promise.resolve({ id: 1, ...data }),
      );

      const result = await service.generateChallan({
        studentId: 1,
        feeStructureId: 1,
        installmentIndex: 0,
        dueDate: '2026-04-15',
      });

      expect(result.discount).toBeGreaterThan(0);
      expect(result.totalAmount).toBeLessThan(10000);
    });

    it('should prevent duplicate challan for same installment', async () => {
      feeChallanRepo.findByStudentAndStructureAndInstallment.mockResolvedValue({
        id: 1,
        challanNumber: 'CH-2026-000001',
      });
      feeStructureRepo.findById.mockResolvedValue({ id: 1, installments: [] });
      studentRepo.findById.mockResolvedValue({ id: 1 });

      await expect(
        service.generateChallan({
          studentId: 1,
          feeStructureId: 1,
          installmentIndex: 0,
          dueDate: '2026-04-15',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException for invalid student', async () => {
      studentRepo.findById.mockResolvedValue(null);

      await expect(
        service.generateChallan({
          studentId: 999,
          feeStructureId: 1,
          installmentIndex: 0,
          dueDate: '2026-04-15',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ────────── recordPayment ──────────
  describe('recordPayment', () => {
    const baseChallan = {
      id: 1,
      challanNumber: 'CH-2026-000001',
      totalAmount: 12500,
      paidAmount: 0,
      discount: 0,
      status: PaymentStatusEnum.pending,
    };

    it('should record a full payment and set status to PAID', async () => {
      feeChallanRepo.findById.mockResolvedValue({ ...baseChallan });
      feePaymentRepo.create.mockResolvedValue({
        id: 1,
        amount: 12500,
        method: PaymentMethodEnum.cash,
        receiptNumber: 'REC-2026-000001',
      });
      feeChallanRepo.update.mockResolvedValue({
        ...baseChallan,
        paidAmount: 12500,
        status: PaymentStatusEnum.paid,
      });

      const result = await service.recordPayment({
        challanId: 1,
        amount: 12500,
        method: PaymentMethodEnum.cash,
      });

      expect(result).toHaveProperty('receiptNumber');
      expect(feeChallanRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ status: PaymentStatusEnum.paid }),
      );
    });

    it('should record partial payment and set status to PARTIAL', async () => {
      feeChallanRepo.findById.mockResolvedValue({ ...baseChallan });
      feePaymentRepo.create.mockResolvedValue({
        id: 1,
        amount: 5000,
        method: PaymentMethodEnum.bank_transfer,
        receiptNumber: 'REC-2026-000002',
      });
      feeChallanRepo.update.mockResolvedValue({
        ...baseChallan,
        paidAmount: 5000,
        status: PaymentStatusEnum.partial,
      });

      const result = await service.recordPayment({
        challanId: 1,
        amount: 5000,
        method: PaymentMethodEnum.bank_transfer,
        transactionRef: 'BT-001',
      });

      expect(result).toHaveProperty('receiptNumber');
      expect(feeChallanRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ status: PaymentStatusEnum.partial }),
      );
    });

    it('should reject overpayment', async () => {
      feeChallanRepo.findById.mockResolvedValue({
        ...baseChallan,
        paidAmount: 12500,
        status: PaymentStatusEnum.paid,
      });

      await expect(
        service.recordPayment({
          challanId: 1,
          amount: 1,
          method: PaymentMethodEnum.cash,
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw NotFoundException for invalid challan', async () => {
      feeChallanRepo.findById.mockResolvedValue(null);

      await expect(
        service.recordPayment({
          challanId: 999,
          amount: 100,
          method: PaymentMethodEnum.cash,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should auto-generate receipt number', async () => {
      feeChallanRepo.findById.mockResolvedValue({ ...baseChallan });
      feePaymentRepo.create.mockImplementation((data: any) =>
        Promise.resolve({ id: 1, receiptNumber: 'REC-2026-000001', ...data }),
      );
      feeChallanRepo.update.mockResolvedValue({
        ...baseChallan,
        paidAmount: 12500,
        status: PaymentStatusEnum.paid,
      });

      const result = await service.recordPayment({
        challanId: 1,
        amount: 12500,
        method: PaymentMethodEnum.cash,
      });

      expect(result.receiptNumber).toMatch(/^REC-\d{4}-\d{6}$/);
    });
  });

  // ────────── applyConcession ──────────
  describe('applyConcession', () => {
    it('should apply a concession to a student', async () => {
      studentRepo.findById.mockResolvedValue({ id: 1 });
      concessionRepo.create.mockResolvedValue({
        id: 1,
        studentId: 1,
        type: 'scholarship',
        discountPercentage: 25,
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2026-12-31'),
      });

      const result = await service.applyConcession({
        studentId: 1,
        type: 'scholarship',
        discountPercentage: 25,
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        reason: 'Merit scholarship',
      });

      expect(result.discountPercentage).toBe(25);
    });

    it('should reject discount above 100', async () => {
      studentRepo.findById.mockResolvedValue({ id: 1 });

      await expect(
        service.applyConcession({
          studentId: 1,
          type: 'scholarship',
          discountPercentage: 150,
          validFrom: '2026-01-01',
          validTo: '2026-12-31',
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should reject discount below 0', async () => {
      studentRepo.findById.mockResolvedValue({ id: 1 });

      await expect(
        service.applyConcession({
          studentId: 1,
          type: 'scholarship',
          discountPercentage: -5,
          validFrom: '2026-01-01',
          validTo: '2026-12-31',
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should reject invalid date range (validFrom > validTo)', async () => {
      studentRepo.findById.mockResolvedValue({ id: 1 });

      await expect(
        service.applyConcession({
          studentId: 1,
          type: 'merit',
          discountPercentage: 10,
          validFrom: '2026-12-31',
          validTo: '2026-01-01',
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  // ────────── calculatePendingAmount ──────────
  describe('calculatePendingAmount', () => {
    it('should sum pending amounts correctly', async () => {
      feeChallanRepo.findByStudentId.mockResolvedValue([
        {
          id: 1,
          totalAmount: 12500,
          paidAmount: 0,
          discount: 0,
          status: PaymentStatusEnum.pending,
        },
        {
          id: 2,
          totalAmount: 12500,
          paidAmount: 6250,
          discount: 0,
          status: PaymentStatusEnum.partial,
        },
        {
          id: 3,
          totalAmount: 12500,
          paidAmount: 12500,
          discount: 0,
          status: PaymentStatusEnum.paid,
        },
      ]);

      const result = await service.calculatePendingAmount(1);

      // pending: 12500, partial remaining: 6250, paid: 0
      expect(result).toBe(18750);
    });

    it('should return 0 when all challans are paid', async () => {
      feeChallanRepo.findByStudentId.mockResolvedValue([
        {
          id: 1,
          totalAmount: 12500,
          paidAmount: 12500,
          discount: 0,
          status: PaymentStatusEnum.paid,
        },
      ]);

      const result = await service.calculatePendingAmount(1);
      expect(result).toBe(0);
    });
  });

  // ────────── sendPaymentReminders ──────────
  describe('sendPaymentReminders', () => {
    it('should send reminders for overdue challans', async () => {
      feeChallanRepo.findPendingByClassId.mockResolvedValue([
        {
          id: 1,
          studentId: 1,
          challanNumber: 'CH-2026-000001',
          totalAmount: 12500,
          paidAmount: 0,
          dueDate: new Date('2026-01-01'),
          student: { id: 1, userId: 10 },
          lastReminderSentAt: null,
        },
      ]);
      studentRepo.findById.mockResolvedValue({
        id: 1,
        userId: 10,
        user: { email: 'test@example.com' },
      });

      const result = await service.sendPaymentReminders({ gradeClassId: 1 });

      expect(result.sent).toBeGreaterThanOrEqual(1);
      expect(mailService.sendPaymentReminder).toHaveBeenCalled();
    });

    it('should skip recently reminded students (throttling)', async () => {
      feeChallanRepo.findPendingByClassId.mockResolvedValue([
        {
          id: 1,
          studentId: 1,
          challanNumber: 'CH-2026-000001',
          totalAmount: 12500,
          paidAmount: 0,
          dueDate: new Date('2026-01-01'),
          student: { id: 1, userId: 10 },
          lastReminderSentAt: new Date(), // just sent
        },
      ]);

      const result = await service.sendPaymentReminders({ gradeClassId: 1 });

      expect(result.skipped).toBeGreaterThanOrEqual(1);
      expect(mailService.sendPaymentReminder).not.toHaveBeenCalled();
    });
  });
});
