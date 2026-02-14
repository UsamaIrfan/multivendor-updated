import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { BranchEntity } from './branch.entity';
import { TenantUserEntity } from './tenant-user.entity';

@Entity({ name: 'tenant' })
export class TenantEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  name!: string;

  @Index({ unique: true })
  @Column({ unique: true })
  slug!: string;

  @Column({ type: String, nullable: true })
  contactEmail!: string | null;

  @Column({ type: String, nullable: true })
  contactPhone!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  settings!: Record<string, unknown> | null;

  @OneToMany(() => BranchEntity, (branch) => branch.tenant)
  branches!: BranchEntity[];

  @OneToMany(() => TenantUserEntity, (tu) => tu.tenant)
  tenantUsers!: TenantUserEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
