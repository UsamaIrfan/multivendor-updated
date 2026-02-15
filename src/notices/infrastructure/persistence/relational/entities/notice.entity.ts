import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantAwareEntityHelper } from '../../../../../utils/tenant-aware-entity-helper';

@Entity({ name: 'notices' })
@Index(['tenantId', 'createdAt'])
export class NoticeEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'simple-array', default: '' })
  targetBranches!: string[];

  @Column({ type: 'simple-array', default: '' })
  targetRoles!: string[];

  @Index()
  @Column()
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments!: string[] | null;

  @Column({ default: false })
  isPublished!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  publishDate!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
