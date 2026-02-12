import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../../utils/relational-entity-helper';
import { StaffEntity } from './staff.entity';
import { UserEntity } from '../../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import {
  LeaveStatusEnum,
  LeaveTypeEnum,
} from '../../../../../common/enums/leave-status.enum';

@Entity({ name: 'staff_leave' })
export class StaffLeaveEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => StaffEntity, (s) => s.leaves, { onDelete: 'CASCADE' })
  staff!: StaffEntity;

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
  approvedBy!: UserEntity | null;

  @Column({ type: 'text', nullable: true })
  adminRemarks!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
