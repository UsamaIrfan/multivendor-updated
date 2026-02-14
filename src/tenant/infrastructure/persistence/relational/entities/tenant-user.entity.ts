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
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { TenantEntity } from './tenant.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Entity({ name: 'tenant_user' })
@Index(['tenant', 'user'], { unique: true })
export class TenantUserEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => TenantEntity, (t) => t.tenantUsers, { onDelete: 'CASCADE' })
  tenant!: TenantEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', eager: true })
  user!: UserEntity;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
