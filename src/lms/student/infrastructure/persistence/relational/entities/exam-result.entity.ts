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
import { ExamSubjectEntity } from './exam-subject.entity';
import { StudentEntity } from './student.entity';

@Entity({ name: 'exam_result' })
@Index(['examSubject', 'student'], { unique: true })
export class ExamResultEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ExamSubjectEntity, (es) => es.results, {
    onDelete: 'CASCADE',
  })
  examSubject!: ExamSubjectEntity;

  @ManyToOne(() => StudentEntity, (s) => s.examResults, {
    onDelete: 'CASCADE',
  })
  student!: StudentEntity;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  marksObtained!: number | null;

  @Column({ type: String, nullable: true })
  grade!: string | null;

  @Column({ type: 'boolean', default: false })
  isAbsent!: boolean;

  @Column({ type: String, nullable: true })
  remarks!: string | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  percentage!: number | null;

  @Column({ type: 'int', nullable: true })
  rank!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
