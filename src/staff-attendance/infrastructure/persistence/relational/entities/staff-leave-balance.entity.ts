import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantAwareEntityHelper } from '../../../../../utils/tenant-aware-entity-helper';
import { StaffMgmtEntity } from '../../../../../staff-management/infrastructure/persistence/relational/entities/staff-mgmt.entity';
import { LeaveTypeEnum } from '../../../../../lms/common/enums/leave-status.enum';

@Entity({ name: 'staff_leave_balance' })
@Index(['tenantId', 'staffId', 'leaveType', 'year'], { unique: true })
export class StaffLeaveBalanceEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => StaffMgmtEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staffId' })
  staff!: StaffMgmtEntity;

  @Index()
  @Column({ type: 'int' })
  staffId!: number;

  @Column({
    type: 'enum',
    enum: LeaveTypeEnum,
    default: LeaveTypeEnum.casual,
  })
  leaveType!: LeaveTypeEnum;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  totalDays!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  usedDays!: number;

  @Column({ type: 'int' })
  year!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
