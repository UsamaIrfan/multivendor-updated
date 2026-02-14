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
import { AdmissionStatusEnum } from '../../../../../common/enums/admission-status.enum';
import { EnquirySourceEnum } from '../../../../../common/enums/general.enum';
import { InstitutionEntity } from '../../../../../courses/infrastructure/persistence/relational/entities/institution.entity';

@Entity({ name: 'admission_enquiry' })
export class AdmissionEnquiryEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => InstitutionEntity, { onDelete: 'CASCADE' })
  institution!: InstitutionEntity;

  @Index()
  @Column()
  studentName!: string;

  @Column({ type: String, nullable: true })
  guardianName!: string | null;

  @Index()
  @Column({ type: String, nullable: true })
  phone!: string | null;

  @Index()
  @Column({ type: String, nullable: true })
  email!: string | null;

  @Column({ type: String, nullable: true })
  previousSchool!: string | null;

  @Column({ type: String, nullable: true })
  gradeApplyingFor!: string | null;

  @Column({
    type: 'enum',
    enum: AdmissionStatusEnum,
    default: AdmissionStatusEnum.new,
  })
  status!: AdmissionStatusEnum;

  @Column({
    type: 'enum',
    enum: EnquirySourceEnum,
    default: EnquirySourceEnum.walk_in,
  })
  source!: EnquirySourceEnum;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'date', nullable: true })
  followUpDate!: Date | null;

  @Column({ type: 'int', nullable: true })
  convertedStudentId!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
