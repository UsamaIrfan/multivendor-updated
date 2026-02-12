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
import { EntityRelationalHelper } from '../../../../../../utils/relational-entity-helper';
import { UserEntity } from '../../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { InstitutionEntity } from '../../../../../courses/infrastructure/persistence/relational/entities/institution.entity';
import { DepartmentEntity } from '../../../../../courses/infrastructure/persistence/relational/entities/department.entity';
import { EmploymentTypeEnum } from '../../../../../common/enums/general.enum';
import { StaffAttendanceEntity } from './staff-attendance.entity';
import { StaffLeaveEntity } from './staff-leave.entity';
import { SalarySlipEntity } from './salary-slip.entity';

@Entity({ name: 'staff' })
export class StaffEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => UserEntity, { eager: true })
  @JoinColumn()
  user!: UserEntity;

  @ManyToOne(() => InstitutionEntity, { onDelete: 'CASCADE' })
  institution!: InstitutionEntity;

  @ManyToOne(() => DepartmentEntity, { nullable: true })
  department!: DepartmentEntity | null;

  @Index({ unique: true })
  @Column({ unique: true })
  employeeId!: string;

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

  @OneToMany(() => StaffAttendanceEntity, (sa) => sa.staff)
  attendances!: StaffAttendanceEntity[];

  @OneToMany(() => StaffLeaveEntity, (sl) => sl.staff)
  leaves!: StaffLeaveEntity[];

  @OneToMany(() => SalarySlipEntity, (ss) => ss.staff)
  salarySlips!: SalarySlipEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
