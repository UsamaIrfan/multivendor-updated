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
import { SubjectEntity } from '../../../../../lms/courses/infrastructure/persistence/relational/entities/subject.entity';

@Entity({ name: 'assignment' })
@Index(['tenantId', 'subjectId'])
export class AssignmentEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => SubjectEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subjectId' })
  subject!: SubjectEntity;

  @Column({ type: 'int' })
  subjectId!: number;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'timestamp' })
  dueDate!: Date;

  @Column({ type: 'int', default: 0 })
  totalMarks!: number;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
