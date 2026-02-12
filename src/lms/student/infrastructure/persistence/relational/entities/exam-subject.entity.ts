import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../../utils/relational-entity-helper';
import { ExamEntity } from './exam.entity';
import { SubjectEntity } from '../../../../../courses/infrastructure/persistence/relational/entities/subject.entity';
import { ExamResultEntity } from './exam-result.entity';

@Entity({ name: 'exam_subject' })
@Index(['exam', 'subject'], { unique: true })
export class ExamSubjectEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ExamEntity, (e) => e.examSubjects, { onDelete: 'CASCADE' })
  exam!: ExamEntity;

  @ManyToOne(() => SubjectEntity, { eager: true })
  subject!: SubjectEntity;

  @Column({ type: 'date', nullable: true })
  examDate!: Date | null;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  totalMarks!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  passingMarks!: number;

  @OneToMany(() => ExamResultEntity, (er) => er.examSubject)
  results!: ExamResultEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
