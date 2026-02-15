import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { StaffMgmtEntity } from './staff-mgmt.entity';

@Entity({ name: 'staff_branch_assignment' })
@Index(['tenantId', 'staffEntityId', 'branchId'], { unique: true })
export class StaffBranchAssignmentEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => StaffMgmtEntity, (s) => s.branchAssignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'staffEntityId' })
  staff!: StaffMgmtEntity;

  @Column()
  staffEntityId!: number;

  @Index()
  @Column({ type: 'uuid' })
  branchId!: string;

  @Column({ type: 'simple-array' })
  roles!: string[];

  @Column({ default: false })
  isPrimary!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
