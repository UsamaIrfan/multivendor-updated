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
import { StudentEntity } from './student.entity';
import { SectionEntity } from '../../../../../courses/infrastructure/persistence/relational/entities/section.entity';
import { AttendanceStatusEnum } from '../../../../../common/enums/attendance-status.enum';

@Entity({ name: 'student_attendance' })
@Index(['student', 'date'], { unique: true })
export class StudentAttendanceEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => StudentEntity, (s) => s.attendances, {
    onDelete: 'CASCADE',
  })
  student!: StudentEntity;

  @ManyToOne(() => SectionEntity, { eager: true })
  section!: SectionEntity;

  @Index()
  @Column({ type: 'date' })
  date!: Date;

  @Column({
    type: 'enum',
    enum: AttendanceStatusEnum,
    default: AttendanceStatusEnum.present,
  })
  status!: AttendanceStatusEnum;

  @Column({ type: String, nullable: true })
  remarks!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
