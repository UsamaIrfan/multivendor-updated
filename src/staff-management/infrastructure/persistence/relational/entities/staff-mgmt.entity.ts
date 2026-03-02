import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantAwareEntityHelper } from '../../../../../utils/tenant-aware-entity-helper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { InstitutionEntity } from '../../../../../lms/courses/infrastructure/persistence/relational/entities/institution.entity';
import { DepartmentEntity } from '../../../../../lms/courses/infrastructure/persistence/relational/entities/department.entity';
import { EmploymentTypeEnum } from '../../../../../lms/common/enums/general.enum';
import { StaffBranchAssignmentEntity } from './staff-branch-assignment.entity';

@Entity({ name: 'staff_mgmt' })
@Index(['tenantId', 'staffId'], { unique: true })
export class StaffMgmtEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => UserEntity, { eager: true })
  @JoinColumn()
  user!: UserEntity;

  @ManyToOne(() => InstitutionEntity, { onDelete: 'CASCADE' })
  institution!: InstitutionEntity;

  @ManyToOne(() => DepartmentEntity, { nullable: true })
  department!: DepartmentEntity | null;

  @Index()
  @Column()
  staffId!: string; // Format: <tenant_slug>-STF-YYYY-XXXX

  @Column({ type: 'uuid', nullable: true })
  primaryBranchId!: string | null;

  @Column({ type: String, nullable: true })
  designation!: string | null;

  @Column({ type: String, nullable: true })
  qualification!: string | null;

  @Column({ type: 'text', nullable: true })
  specialization!: string | null;

  @Column({ type: 'int', nullable: true })
  experienceYears!: number | null;

  @Column({ type: 'date', nullable: true })
  joiningDate!: Date | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  basicSalary!: number;

  @Column({
    type: 'enum',
    enum: EmploymentTypeEnum,
    default: EmploymentTypeEnum.full_time,
  })
  employmentType!: EmploymentTypeEnum;

  @Column({ type: String, nullable: true })
  emergencyContact!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @OneToMany(() => StaffBranchAssignmentEntity, (sba) => sba.staff, {
    cascade: true,
  })
  branchAssignments!: StaffBranchAssignmentEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
