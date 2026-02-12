import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../../utils/relational-entity-helper';
import { FeeChallanEntity } from './fee-challan.entity';
import { PaymentMethodEnum } from '../../../../../common/enums/payment-status.enum';

@Entity({ name: 'fee_payment' })
export class FeePaymentEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => FeeChallanEntity, (fc) => fc.payments, {
    onDelete: 'CASCADE',
  })
  feeChallan!: FeeChallanEntity;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({
    type: 'enum',
    enum: PaymentMethodEnum,
    default: PaymentMethodEnum.cash,
  })
  method!: PaymentMethodEnum;

  @Column({ type: String, nullable: true })
  transactionRef!: string | null;

  @Column({ type: String, nullable: true })
  receiptNumber!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  paidAt!: Date | null;

  @Column({ type: String, nullable: true })
  remarks!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
