import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantAwareEntityHelper } from '../../../../../utils/tenant-aware-entity-helper';
import { SalaryStatusEnum } from '../../../../../lms/common/enums/general.enum';

@Entity({ name: 'payroll_slip' })
@Index(['tenantId', 'staffId', 'month', 'year'], { unique: true })
export class PayrollSlipEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  staffId!: number;

  @Column({ type: 'int' })
  structureId!: number;

  @Column({ type: 'int' })
  month!: number;

  @Column({ type: 'int' })
  year!: number;

  @Column({ type: 'jsonb' })
  breakdown!: {
    earnings: { name: string; type: string; amount: number }[];
    deductions: { name: string; type: string; amount: number }[];
    totalEarnings: number;
    totalDeductions: number;
    netPay: number;
  };

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalEarnings!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalDeductions!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  netPay!: number;

  @Column({ type: 'int', default: 0 })
  workingDays!: number;

  @Column({ type: 'int', default: 0 })
  presentDays!: number;

  @Column({
    type: 'enum',
    enum: SalaryStatusEnum,
    default: SalaryStatusEnum.processed,
  })
  status!: SalaryStatusEnum;

  @Column({ type: 'timestamp', nullable: true })
  paidAt!: Date | null;

  @Column({ type: String, nullable: true })
  remarks!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
