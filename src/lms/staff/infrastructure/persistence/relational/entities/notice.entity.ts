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
import { StaffEntity } from './staff.entity';
import { TargetAudienceEnum } from '../../../../../common/enums/general.enum';

@Entity({ name: 'notice' })
export class NoticeEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => InstitutionEntity, { onDelete: 'CASCADE' })
  institution!: InstitutionEntity;

  @ManyToOne(() => StaffEntity, { nullable: true })
  publishedBy!: StaffEntity | null;

  @Index()
  @Column()
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({
    type: 'enum',
    enum: TargetAudienceEnum,
    default: TargetAudienceEnum.all,
  })
  targetAudience!: TargetAudienceEnum;

  @Column({ default: false })
  isPublished!: boolean;

  @Column({ type: 'date', nullable: true })
  publishDate!: Date | null;

  @Column({ type: 'date', nullable: true })
  expiryDate!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
