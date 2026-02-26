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
import { TenantAwareEntityHelper } from '../../../../../utils/tenant-aware-entity-helper';
import { GradeClassEntity } from '../../../../../lms/courses/infrastructure/persistence/relational/entities/grade-class.entity';
import { SectionEntity } from '../../../../../lms/courses/infrastructure/persistence/relational/entities/section.entity';
import { AcademicYearEntity } from '../../../../../lms/academic/infrastructure/persistence/relational/entities/academic-year.entity';

@Entity({ name: 'timetables' })
@Index(['tenantId', 'branchId'])
export class TimetableEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => GradeClassEntity, { eager: false, onDelete: 'CASCADE' })
  gradeClass!: GradeClassEntity;

  @ManyToOne(() => SectionEntity, {
    eager: false,
    nullable: true,
    onDelete: 'SET NULL',
  })
  section!: SectionEntity | null;

  @ManyToOne(() => AcademicYearEntity, { eager: false, onDelete: 'CASCADE' })
  academicYear!: AcademicYearEntity;

  @Column({ type: String, nullable: true })
  name!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
