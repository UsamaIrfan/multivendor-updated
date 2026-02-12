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
import { EntityRelationalHelper } from '../../../../../../utils/relational-entity-helper';
import { InstitutionEntity } from '../../../../../courses/infrastructure/persistence/relational/entities/institution.entity';
import { SalarySlipEntity } from '../../../../../staff/infrastructure/persistence/relational/entities/salary-slip.entity';
import { ExpenseStatusEnum } from '../../../../../common/enums/general.enum';

@Entity({ name: 'expense' })
export class ExpenseEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => InstitutionEntity, { onDelete: 'CASCADE' })
  institution!: InstitutionEntity;

  @ManyToOne(() => SalarySlipEntity, { nullable: true })
  salarySlip!: SalarySlipEntity | null;

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
  paidTo!: string | null;

  @Column({
    type: 'enum',
    enum: ExpenseStatusEnum,
    default: ExpenseStatusEnum.pending,
  })
  status!: ExpenseStatusEnum;

  @Column({ type: String, nullable: true })
  remarks!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
