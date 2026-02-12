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
import { EntityRelationalHelper } from '../../../../../../utils/relational-entity-helper';
import { StaffEntity } from './staff.entity';
import { AttendanceStatusEnum } from '../../../../../common/enums/attendance-status.enum';

@Entity({ name: 'staff_attendance' })
@Index(['staff', 'date'], { unique: true })
export class StaffAttendanceEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => StaffEntity, (s) => s.attendances, { onDelete: 'CASCADE' })
  staff!: StaffEntity;

  @Index()
  @Column({ type: 'date' })
  date!: Date;

  @Column({
    type: 'enum',
    enum: AttendanceStatusEnum,
    default: AttendanceStatusEnum.present,
  })
  status!: AttendanceStatusEnum;

  @Column({ type: 'time', nullable: true })
  checkIn!: string | null;

  @Column({ type: 'time', nullable: true })
  checkOut!: string | null;

  @Column({ type: String, nullable: true })
  remarks!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
