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

@Entity({ name: 'branch' })
@Index(['tenant', 'code'], { unique: true })
export class BranchEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => TenantEntity, (t) => t.branches, { onDelete: 'CASCADE' })
  tenant!: TenantEntity;

  @Column()
  name!: string;

  @Column()
  code!: string;

  @Column({ type: String, nullable: true })
  address!: string | null;

  @Column({ type: String, nullable: true })
  city!: string | null;

  @Column({ type: String, nullable: true })
  state!: string | null;

  @Column({ type: String, nullable: true })
  country!: string | null;

  @Column({ type: String, nullable: true })
  phone!: string | null;

  @Column({ type: String, nullable: true })
  email!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isHeadquarters!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
