import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { RoleEntity } from '../../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { PermissionEntity } from './permission.entity';
import { PermissionScopeEnum } from '../../../../enums';

@Entity({ name: 'role_permission' })
@Unique(['roleId', 'permissionId'])
export class RolePermissionEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'int' })
  roleId!: number;

  @Column({ type: 'int' })
  permissionId!: number;

  @Column({
    type: 'enum',
    enum: PermissionScopeEnum,
    default: PermissionScopeEnum.TENANT,
  })
  scope!: PermissionScopeEnum;

  @ManyToOne(() => RoleEntity, { onDelete: 'CASCADE' })
  role!: RoleEntity;

  @ManyToOne(() => PermissionEntity, (p) => p.rolePermissions, {
    onDelete: 'CASCADE',
    eager: true,
  })
  permission!: PermissionEntity;
}
