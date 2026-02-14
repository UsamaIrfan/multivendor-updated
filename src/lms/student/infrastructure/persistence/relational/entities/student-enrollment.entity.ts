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
import { AcademicYearEntity } from '../../../../../academic/infrastructure/persistence/relational/entities/academic-year.entity';
import { EnrollmentStatusEnum } from '../../../../../common/enums/general.enum';

@Entity({ name: 'student_enrollment' })
@Index(['student', 'academicYear'], { unique: true })
export class StudentEnrollmentEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => StudentEntity, (s) => s.enrollments, {
    onDelete: 'CASCADE',
  })
  student!: StudentEntity;

  @ManyToOne(() => SectionEntity, { eager: true })
  section!: SectionEntity;

  @ManyToOne(() => AcademicYearEntity, { eager: true })
  academicYear!: AcademicYearEntity;

  @Column({
    type: 'enum',
    enum: EnrollmentStatusEnum,
    default: EnrollmentStatusEnum.active,
  })
  status!: EnrollmentStatusEnum;

  @Column({ type: 'date', nullable: true })
  enrollmentDate!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
