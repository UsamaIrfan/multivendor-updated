import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SalaryStructureRepository } from './infrastructure/persistence/salary-structure.repository';
import { PayrollSlipRepository } from './infrastructure/persistence/payroll-slip.repository';
import { TenantRepository } from '../tenant/infrastructure/persistence/tenant.repository';
import { AccountsService } from '../lms/accounts/accounts.service';
import { TenantContextService } from '../tenant/tenant-context/tenant-context.service';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { UpdateSalaryStructureDto } from './dto/update-salary-structure.dto';
import { ProcessPayrollDto } from './dto/process-payroll.dto';
import { SalaryStructure, SalaryComponent } from './domain/salary-structure';
import { PayrollSlip, SalaryBreakdown } from './domain/payroll-slip';
import { ExpenseStatusEnum } from '../lms/common/enums/general.enum';

@Injectable()
export class PayrollService {
  constructor(
    private readonly structureRepo: SalaryStructureRepository,
    private readonly slipRepo: PayrollSlipRepository,
    private readonly tenantRepo: TenantRepository,
    private readonly accountsService: AccountsService,
    private readonly tenantContext: TenantContextService,
  ) {}

  // ─── Salary Structure CRUD ────────────────────────────

  async createStructure(
    dto: CreateSalaryStructureDto,
  ): Promise<SalaryStructure> {
    const tenantId = dto.tenantId || this.tenantContext.getTenantId();
    const branchId = dto.branchId || this.tenantContext.getBranchId() || null;

    // Calculate totals from components
    const { totalEarnings, totalDeductions, netPay } =
      this.calculateFromComponents(dto.components);

    return this.structureRepo.create({
      staffId: dto.staffId,
      name: dto.name,
      components: dto.components as SalaryComponent[],
      totalEarnings,
      totalDeductions,
      netPay,
      isActive: dto.isActive ?? true,
      tenantId,
      branchId,
    });
  }

  async findAllStructures(): Promise<SalaryStructure[]> {
    return this.structureRepo.findAll();
  }

  async findOneStructure(id: number): Promise<SalaryStructure> {
    const structure = await this.structureRepo.findById(id);
    if (!structure) {
      throw new NotFoundException(`Salary structure not found: ${id}`);
    }
    return structure;
  }

  async updateStructure(
    id: number,
    dto: UpdateSalaryStructureDto,
  ): Promise<SalaryStructure> {
    await this.findOneStructure(id);

    const updateData: Record<string, unknown> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.staffId !== undefined) updateData.staffId = dto.staffId;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    if (dto.components !== undefined) {
      updateData.components = dto.components;
      const { totalEarnings, totalDeductions, netPay } =
        this.calculateFromComponents(dto.components);
      updateData.totalEarnings = totalEarnings;
      updateData.totalDeductions = totalDeductions;
      updateData.netPay = netPay;
    }

    const updated = await this.structureRepo.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(
        `Salary structure not found after update: ${id}`,
      );
    }
    return updated;
  }

  async removeStructure(id: number): Promise<void> {
    await this.findOneStructure(id);
    await this.structureRepo.remove(id);
  }

  // ─── Payroll Processing ───────────────────────────────

  async processPayroll(
    dto: ProcessPayrollDto,
  ): Promise<{ processedCount: number; slips: PayrollSlip[] }> {
    const tenantId = dto.tenantId || this.tenantContext.getTenantId();

    // Check for existing processed payroll for this month
    const existingSlips = await this.slipRepo.findByMonth(dto.month, dto.year);
    if (existingSlips.length > 0) {
      throw new ConflictException(
        `Payroll already processed for ${dto.month}/${dto.year}`,
      );
    }

    // Get all active salary structures for the tenant
    const structures = await this.structureRepo.findActiveByTenant();

    // Filter by branch if specified
    let filteredStructures = structures;
    if (dto.branchId) {
      filteredStructures = structures.filter(
        (s) => s.branchId === dto.branchId || s.branchId === null,
      );
    }

    const slips: PayrollSlip[] = [];

    for (const structure of filteredStructures) {
      const slip = await this.generateSlip(
        structure,
        dto.month,
        dto.year,
        tenantId,
        dto.branchId ?? structure.branchId,
      );
      slips.push(slip);
    }

    return { processedCount: slips.length, slips };
  }

  // ─── Salary Slips ─────────────────────────────────────

  async findAllSlips(): Promise<PayrollSlip[]> {
    return this.slipRepo.findAll();
  }

  async findOneSlip(id: number): Promise<PayrollSlip> {
    const slip = await this.slipRepo.findById(id);
    if (!slip) {
      throw new NotFoundException(`Salary slip not found: ${id}`);
    }
    return slip;
  }

  // ─── PDF Generation ───────────────────────────────────

  async generatePdf(slipId: number): Promise<Buffer> {
    const slip = await this.findOneSlip(slipId);
    const tenant = await this.tenantRepo.findById(slip.tenantId);

    if (!tenant) {
      throw new NotFoundException(`Tenant not found: ${slip.tenantId}`);
    }

    // Build a simple PDF-like buffer with tenant branding
    const pdfContent = this.buildPdfContent(tenant, slip);
    return Buffer.from(pdfContent);
  }

  // ─── Private Helpers ──────────────────────────────────

  private async generateSlip(
    structure: SalaryStructure,
    month: number,
    year: number,
    tenantId: string,
    branchId: string | null,
  ): Promise<PayrollSlip> {
    // Check for duplicate
    const existing = await this.slipRepo.findByStaffAndMonth(
      structure.staffId,
      month,
      year,
    );
    if (existing) {
      return existing; // Skip already processed
    }

    // Build breakdown from structure components
    const breakdown = this.buildBreakdown(structure.components);

    const slip = await this.slipRepo.create({
      staffId: structure.staffId,
      structureId: structure.id,
      month,
      year,
      breakdown: breakdown as any,
      totalEarnings: breakdown.totalEarnings,
      totalDeductions: breakdown.totalDeductions,
      netPay: breakdown.netPay,
      workingDays: this.getWorkingDaysInMonth(month, year),
      presentDays: this.getWorkingDaysInMonth(month, year),
      tenantId,
      branchId,
    });

    // Create expense entry in tenant's accounts
    try {
      await this.accountsService.createExpense({
        tenantId,
        branchId,
        institutionId: 1,
        category: 'SALARY',
        amount: breakdown.netPay,
        date: new Date(year, month - 1, 28).toISOString(),
        referenceNumber: `PAYROLL-${slip.id}`,
        description: `Salary for staff #${structure.staffId} — ${month}/${year}`,
        paidTo: `Staff #${structure.staffId}`,
        status: ExpenseStatusEnum.approved,
      });
    } catch {
      // Non-critical: expense creation failure shouldn't block payroll
    }

    return slip;
  }

  private calculateFromComponents(
    components: { name: string; type: string; amount: number }[],
  ): { totalEarnings: number; totalDeductions: number; netPay: number } {
    const totalEarnings = components
      .filter((c) => c.type === 'earning')
      .reduce((sum, c) => sum + c.amount, 0);
    const totalDeductions = components
      .filter((c) => c.type === 'deduction')
      .reduce((sum, c) => sum + c.amount, 0);
    return {
      totalEarnings,
      totalDeductions,
      netPay: totalEarnings - totalDeductions,
    };
  }

  private buildBreakdown(components: SalaryComponent[]): SalaryBreakdown {
    const earnings = components.filter((c) => c.type === 'earning');
    const deductions = components.filter((c) => c.type === 'deduction');
    const totalEarnings = earnings.reduce((sum, c) => sum + c.amount, 0);
    const totalDeductions = deductions.reduce((sum, c) => sum + c.amount, 0);
    const netPay = totalEarnings - totalDeductions;

    const breakdown = new SalaryBreakdown();
    breakdown.earnings = earnings;
    breakdown.deductions = deductions;
    breakdown.totalEarnings = totalEarnings;
    breakdown.totalDeductions = totalDeductions;
    breakdown.netPay = netPay;
    return breakdown;
  }

  private getWorkingDaysInMonth(month: number, year: number): number {
    const date = new Date(year, month, 0); // Last day of the month
    const totalDays = date.getDate();
    let workingDays = 0;
    for (let d = 1; d <= totalDays; d++) {
      const day = new Date(year, month - 1, d).getDay();
      if (day !== 0 && day !== 6) workingDays++;
    }
    return workingDays;
  }

  private buildPdfContent(
    tenant: {
      name: string;
      slug: string;
      settings?: Record<string, unknown> | null;
    },
    slip: PayrollSlip,
  ): string {
    // Simple text-based PDF content with tenant branding
    const lines = [
      `%PDF-1.4`,
      `% Salary Slip`,
      `% Tenant: ${tenant.name}`,
      `% Slug: ${tenant.slug}`,
      `%`,
      `% Staff ID: ${slip.staffId}`,
      `% Period: ${slip.month}/${slip.year}`,
      `%`,
      `% === EARNINGS ===`,
      ...(slip.breakdown?.earnings ?? []).map(
        (e) => `% ${e.name}: ${e.amount}`,
      ),
      `% Total Earnings: ${slip.totalEarnings}`,
      `%`,
      `% === DEDUCTIONS ===`,
      ...(slip.breakdown?.deductions ?? []).map(
        (d) => `% ${d.name}: ${d.amount}`,
      ),
      `% Total Deductions: ${slip.totalDeductions}`,
      `%`,
      `% NET PAY: ${slip.netPay}`,
      `% Status: ${slip.status}`,
      `% Working Days: ${slip.workingDays}`,
      `% Present Days: ${slip.presentDays}`,
    ];
    return lines.join('\n');
  }
}
