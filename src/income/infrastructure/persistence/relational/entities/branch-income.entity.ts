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

@Entity({ name: 'branch_income' })
@Index(['tenantId', 'branchId', 'date'])
export class BranchIncomeEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  category!: string;

  @Column({ type: String, nullable: true })
  description!: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Index()
  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: String, nullable: true })
  referenceNumber!: string | null;

  @Column({ type: String, nullable: true })
  receivedFrom!: string | null;

  @Column({ type: String, nullable: true })
  remarks!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
