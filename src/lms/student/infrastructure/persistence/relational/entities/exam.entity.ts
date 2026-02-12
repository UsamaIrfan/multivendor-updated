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
import { TermEntity } from '../../../../../academic/infrastructure/persistence/relational/entities/term.entity';
import { ExamTypeEnum } from '../../../../../common/enums/exam.enum';
import { ExamSubjectEntity } from './exam-subject.entity';

@Entity({ name: 'exam' })
export class ExamEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => TermEntity, { onDelete: 'CASCADE' })
  term!: TermEntity;

  @Column()
  name!: string;

  @Column({
    type: 'enum',
    enum: ExamTypeEnum,
    default: ExamTypeEnum.midterm,
  })
  type!: ExamTypeEnum;

  @Index()
  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date' })
  endDate!: Date;

  @Column({ type: String, nullable: true })
  description!: string | null;

  @OneToMany(() => ExamSubjectEntity, (es) => es.exam)
  examSubjects!: ExamSubjectEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
