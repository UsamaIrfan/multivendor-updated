import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantAwareEntityHelper } from '../../../../../utils/tenant-aware-entity-helper';

@Entity({ name: 'grading_scale' })
export class GradingScaleEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ type: 'jsonb' })
  grades!: Array<{
    minPercentage: number;
    maxPercentage: number;
    grade: string;
    gradePoint: number;
    description?: string;
  }>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
