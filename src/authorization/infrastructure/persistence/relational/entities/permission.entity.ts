import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { RolePermissionEntity } from './role-permission.entity';

@Entity({ name: 'permission' })
export class PermissionEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  code!: string;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  domain!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => RolePermissionEntity, (rp) => rp.permission)
  rolePermissions!: RolePermissionEntity[];
}
