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

@Entity({ name: 'timetables' })
@Index(['tenantId', 'branchId', 'classId'])
export class TimetableEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  classId!: string;

  @Index()
  @Column({ type: 'uuid' })
  academicYearId!: string;

  @Column({ type: String, nullable: true })
  name!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
