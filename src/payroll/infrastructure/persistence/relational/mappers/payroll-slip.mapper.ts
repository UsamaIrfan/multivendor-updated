import { PayrollSlip } from '../../../../domain/payroll-slip';
import { SalaryBreakdown } from '../../../../domain/payroll-slip';
import { SalaryComponent } from '../../../../domain/salary-structure';
import { PayrollSlipEntity } from '../entities/payroll-slip.entity';

export class PayrollSlipMapper {
  static toDomain(entity: PayrollSlipEntity): PayrollSlip {
    const domain = new PayrollSlip();
    domain.id = entity.id;
    domain.staffId = entity.staffId;
    domain.structureId = entity.structureId;
    domain.month = entity.month;
    domain.year = entity.year;

    // Map breakdown from JSON
    const bd = entity.breakdown ?? {
      earnings: [],
      deductions: [],
      totalEarnings: 0,
      totalDeductions: 0,
      netPay: 0,
    };
    const breakdown = new SalaryBreakdown();
    breakdown.earnings = (bd.earnings ?? []).map((e) => {
      const comp = new SalaryComponent();
      comp.name = e.name;
      comp.type = 'earning';
      comp.amount = e.amount;
      return comp;
    });
    breakdown.deductions = (bd.deductions ?? []).map((d) => {
      const comp = new SalaryComponent();
      comp.name = d.name;
      comp.type = 'deduction';
      comp.amount = d.amount;
      return comp;
    });
    breakdown.totalEarnings = bd.totalEarnings;
    breakdown.totalDeductions = bd.totalDeductions;
    breakdown.netPay = bd.netPay;
    domain.breakdown = breakdown;

    domain.totalEarnings = Number(entity.totalEarnings);
    domain.totalDeductions = Number(entity.totalDeductions);
    domain.netPay = Number(entity.netPay);
    domain.workingDays = entity.workingDays;
    domain.presentDays = entity.presentDays;
    domain.status = entity.status;
    domain.paidAt = entity.paidAt;
    domain.remarks = entity.remarks;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: PayrollSlip): PayrollSlipEntity {
    const entity = new PayrollSlipEntity();
    if (domain.id) entity.id = domain.id;
    entity.staffId = domain.staffId;
    entity.structureId = domain.structureId;
    entity.month = domain.month;
    entity.year = domain.year;
    entity.breakdown = {
      earnings: (domain.breakdown?.earnings ?? []).map((e) => ({
        name: e.name,
        type: e.type,
        amount: e.amount,
      })),
      deductions: (domain.breakdown?.deductions ?? []).map((d) => ({
        name: d.name,
        type: d.type,
        amount: d.amount,
      })),
      totalEarnings: domain.breakdown?.totalEarnings ?? 0,
      totalDeductions: domain.breakdown?.totalDeductions ?? 0,
      netPay: domain.breakdown?.netPay ?? 0,
    };
    entity.totalEarnings = domain.totalEarnings;
    entity.totalDeductions = domain.totalDeductions;
    entity.netPay = domain.netPay;
    entity.workingDays = domain.workingDays;
    entity.presentDays = domain.presentDays;
    entity.status = domain.status;
    entity.paidAt = domain.paidAt;
    entity.remarks = domain.remarks;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    return entity;
  }
}
