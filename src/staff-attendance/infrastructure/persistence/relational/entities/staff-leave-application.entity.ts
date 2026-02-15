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
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import {
  LeaveStatusEnum,
  LeaveTypeEnum,
} from '../../../../../lms/common/enums/leave-status.enum';

@Entity({ name: 'staff_leave_application' })
export class StaffLeaveApplicationEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => StaffMgmtEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staffId' })
  staff!: StaffMgmtEntity;

  @Index()
  @Column({ type: 'int' })
  staffId!: number;

  @Column({ type: 'date' })
  fromDate!: Date;

  @Column({ type: 'date' })
  toDate!: Date;

  @Column({
    type: 'enum',
    enum: LeaveTypeEnum,
    default: LeaveTypeEnum.casual,
  })
  leaveType!: LeaveTypeEnum;

  @Column({ type: 'text' })
  reason!: string;

  @Column({
    type: 'enum',
    enum: LeaveStatusEnum,
    default: LeaveStatusEnum.pending,
  })
  status!: LeaveStatusEnum;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy!: UserEntity | null;

  @Column({ type: 'int', nullable: true })
  approvedById!: number | null;

  @Column({ type: 'text', nullable: true })
  adminRemarks!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
