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
import { StudentEntity } from './student.entity';
import { FeeStructureEntity } from './fee-structure.entity';
import { FeePaymentEntity } from './fee-payment.entity';
import { PaymentStatusEnum } from '../../../../../common/enums/payment-status.enum';

@Entity({ name: 'fee_challan' })
export class FeeChallanEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => StudentEntity, (s) => s.feeChallans, {
    onDelete: 'CASCADE',
  })
  student!: StudentEntity;

  @ManyToOne(() => FeeStructureEntity, { eager: true })
  feeStructure!: FeeStructureEntity;

  @Index({ unique: true })
  @Column({ unique: true })
  challanNumber!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  paidAmount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount!: number;

  @Index()
  @Column({ type: 'date' })
  dueDate!: Date;

  @Column({ type: 'date', nullable: true })
  issueDate!: Date | null;

  @Column({
    type: 'enum',
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.pending,
  })
  status!: PaymentStatusEnum;

  @Column({ type: String, nullable: true })
  remarks!: string | null;

  @OneToMany(() => FeePaymentEntity, (fp) => fp.feeChallan)
  payments!: FeePaymentEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
