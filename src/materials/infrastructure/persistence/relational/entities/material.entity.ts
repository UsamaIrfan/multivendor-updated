import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantAwareEntityHelper } from '../../../../../utils/tenant-aware-entity-helper';
import { SubjectEntity } from '../../../../../lms/courses/infrastructure/persistence/relational/entities/subject.entity';
import { CourseMaterialTypeEnum } from '../../../../../lms/common/enums/general.enum';

@Entity({ name: 'material' })
@Index(['tenantId', 'subjectId'])
export class MaterialEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => SubjectEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subjectId' })
  subject!: SubjectEntity;

  @Column({ type: 'int' })
  subjectId!: number;

  @Column({ type: 'int', nullable: true })
  uploadedById!: number | null;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    type: 'enum',
    enum: CourseMaterialTypeEnum,
    default: CourseMaterialTypeEnum.document,
  })
  type!: CourseMaterialTypeEnum;

  @Column({ type: String, nullable: true })
  filePath!: string | null;

  @Column({ type: 'bigint', default: 0 })
  fileSize!: number;

  @Column({ type: String, nullable: true })
  externalUrl!: string | null;

  @Column({ type: 'int', default: 1 })
  version!: number;

  @Column({ type: 'int', default: 0 })
  downloadCount!: number;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
