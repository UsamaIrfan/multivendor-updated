import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantAwareEntityHelper } from '../../../../../../utils/tenant-aware-entity-helper';
import { StaffEntity } from './staff.entity';
import { SalaryStatusEnum } from '../../../../../common/enums/general.enum';

@Entity({ name: 'salary_slip' })
@Index(['staff', 'month', 'year'], { unique: true })
export class SalarySlipEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => StaffEntity, (s) => s.salarySlips, { onDelete: 'CASCADE' })
  staff!: StaffEntity;

  @Column({ type: 'int' })
  month!: number;

  @Column({ type: 'int' })
  year!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  basicSalary!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  allowances!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  deductions!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  netSalary!: number;

  @Column({ type: 'int', default: 0 })
  workingDays!: number;

  @Column({ type: 'int', default: 0 })
  presentDays!: number;

  @Column({
    type: 'enum',
    enum: SalaryStatusEnum,
    default: SalaryStatusEnum.draft,
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
