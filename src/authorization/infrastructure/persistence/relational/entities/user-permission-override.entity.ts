import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { PermissionEntity } from './permission.entity';
import {
  PermissionOverrideActionEnum,
  PermissionScopeEnum,
} from '../../../../enums';

@Entity({ name: 'user_permission_override' })
@Unique(['userId', 'tenantId', 'permissionId'])
export class UserPermissionOverrideEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  userId!: number;

  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'int' })
  permissionId!: number;

  @Column({
    type: 'enum',
    enum: PermissionOverrideActionEnum,
    default: PermissionOverrideActionEnum.GRANT,
  })
  action!: PermissionOverrideActionEnum;

  @Column({
    type: 'enum',
    enum: PermissionScopeEnum,
    nullable: true,
  })
  scope!: PermissionScopeEnum | null;

  @Column({ type: 'int', nullable: true })
  grantedBy!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => PermissionEntity, { onDelete: 'CASCADE', eager: true })
  permission!: PermissionEntity;
}
