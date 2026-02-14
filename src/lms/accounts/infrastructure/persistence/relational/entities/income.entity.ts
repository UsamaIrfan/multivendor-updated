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
import { InstitutionEntity } from '../../../../../courses/infrastructure/persistence/relational/entities/institution.entity';
import { FeePaymentEntity } from '../../../../../student/infrastructure/persistence/relational/entities/fee-payment.entity';

@Entity({ name: 'income' })
export class IncomeEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => InstitutionEntity, { onDelete: 'CASCADE' })
  institution!: InstitutionEntity;

  @ManyToOne(() => FeePaymentEntity, { nullable: true })
  feePayment!: FeePaymentEntity | null;

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
