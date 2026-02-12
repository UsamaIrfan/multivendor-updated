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
import { StudentEntity } from './student.entity';
import { UserEntity } from '../../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { LeaveStatusEnum } from '../../../../../common/enums/leave-status.enum';

@Entity({ name: 'student_leave_request' })
export class LeaveRequestEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => StudentEntity, (s) => s.leaveRequests, {
    onDelete: 'CASCADE',
  })
  student!: StudentEntity;

  @Column({ type: 'date' })
  fromDate!: Date;

  @Column({ type: 'date' })
  toDate!: Date;

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
