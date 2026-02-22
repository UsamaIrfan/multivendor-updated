import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({ name: 'audit_log' })
@Index(['tenantId', 'createdAt'])
export class AuditLogEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ type: 'int' })
  userId!: number;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  action!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  resourceType!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  resourceId!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  details!: Record<string, any> | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
