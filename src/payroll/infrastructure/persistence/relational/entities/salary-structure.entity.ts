import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantAwareEntityHelper } from '../../../../../utils/tenant-aware-entity-helper';

@Entity({ name: 'salary_structure' })
@Index(['tenantId', 'staffId'])
export class SalaryStructureEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  staffId!: number;

  @Column({ type: String })
  name!: string;

  @Column({ type: 'jsonb' })
  components!: {
    name: string;
    type: 'earning' | 'deduction';
    amount: number;
  }[];

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalEarnings!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalDeductions!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  netPay!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
