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
import { AssignmentEntity } from './assignment.entity';

@Entity({ name: 'assignment_submission' })
@Index(['tenantId', 'assignmentId'])
@Index(['tenantId', 'studentId'])
export class AssignmentSubmissionEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => AssignmentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assignmentId' })
  assignment!: AssignmentEntity;

  @Column({ type: 'int' })
  assignmentId!: number;

  @Column({ type: 'int' })
  studentId!: number;

  @Column({ type: String, nullable: true })
  filePath!: string | null;

  @Column({ type: 'bigint', default: 0 })
  fileSize!: number;

  @Column({ type: 'text', nullable: true })
  remarks!: string | null;

  @Column({ type: 'int', nullable: true })
  marks!: number | null;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  submittedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
