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
import { FeePaymentEntity } from '../../../../../lms/student/infrastructure/persistence/relational/entities/fee-payment.entity';

@Entity({ name: 'fee_receipt' })
export class ReceiptEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => FeePaymentEntity, { onDelete: 'CASCADE' })
  payment!: FeePaymentEntity;

  @Index({ unique: true })
  @Column({ unique: true })
  receiptNumber!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: String, nullable: true })
  studentName!: string | null;

  @Column({ type: String, nullable: true })
  challanNumber!: string | null;

  @Column({ type: String, nullable: true })
  paymentMethod!: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  issuedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
