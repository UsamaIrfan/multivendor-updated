import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantAwareEntityHelper } from '../../../../../utils/tenant-aware-entity-helper';
import { StudentEntity } from '../../../../../lms/student/infrastructure/persistence/relational/entities/student.entity';
import { ConcessionTypeEnum } from '../../../../domain/concession-type.enum';

@Entity({ name: 'fee_concession' })
export class ConcessionEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => StudentEntity, { onDelete: 'CASCADE' })
  student!: StudentEntity;

  @Column({ type: 'enum', enum: ConcessionTypeEnum })
  type!: ConcessionTypeEnum;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  discountPercentage!: number;

  @Column({ type: 'date' })
  validFrom!: Date;

  @Column({ type: 'date' })
  validTo!: Date;

  @Column({ type: String, nullable: true })
  reason!: string | null;

  @Column({ type: 'boolean', default: false })
  approved!: boolean;

  @Column({ type: Number, nullable: true })
  approvedBy!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
