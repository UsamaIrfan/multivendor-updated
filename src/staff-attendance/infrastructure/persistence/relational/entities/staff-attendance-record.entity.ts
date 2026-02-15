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
import { AttendanceStatusEnum } from '../../../../../lms/common/enums/attendance-status.enum';

@Entity({ name: 'staff_attendance_record' })
@Index(['tenantId', 'staffId', 'date'], { unique: true })
export class StaffAttendanceRecordEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => StaffMgmtEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staffId' })
  staff!: StaffMgmtEntity;

  @Index()
  @Column({ type: 'int' })
  staffId!: number;

  @Index()
  @Column({ type: 'date' })
  date!: string;

  @Column({
    type: 'enum',
    enum: AttendanceStatusEnum,
    default: AttendanceStatusEnum.present,
  })
  status!: AttendanceStatusEnum;

  @Column({ type: 'timestamp' })
  checkInTime!: Date;

  @Column({ type: 'timestamp', nullable: true })
  checkOutTime!: Date | null;

  @Column({ type: String, nullable: true })
  remarks!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
