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
import { GradeClassEntity } from '../../../../../courses/infrastructure/persistence/relational/entities/grade-class.entity';
import { AcademicYearEntity } from '../../../../../academic/infrastructure/persistence/relational/entities/academic-year.entity';
import { FeeFrequencyEnum } from '../../../../../common/enums/payment-status.enum';

@Entity({ name: 'fee_structure' })
@Index(['institution', 'gradeClass', 'academicYear', 'name'], { unique: true })
export class FeeStructureEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => InstitutionEntity, { onDelete: 'CASCADE' })
  institution!: InstitutionEntity;

  @ManyToOne(() => GradeClassEntity, { nullable: true })
  gradeClass!: GradeClassEntity | null;

  @ManyToOne(() => AcademicYearEntity, { nullable: true })
  academicYear!: AcademicYearEntity | null;

  @Column()
  name!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({
    type: 'enum',
    enum: FeeFrequencyEnum,
    default: FeeFrequencyEnum.monthly,
  })
  frequency!: FeeFrequencyEnum;

  @Column({ type: String, nullable: true })
  description!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
