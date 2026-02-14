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
import { TenantAwareEntityHelper } from '../../../../../../utils/tenant-aware-entity-helper';
import { AcademicYearEntity } from '../../../../../academic/infrastructure/persistence/relational/entities/academic-year.entity';
import { DepartmentEntity } from './department.entity';
import { GradeClassEntity } from './grade-class.entity';

@Entity({ name: 'institution' })
export class InstitutionEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column()
  name!: string;

  @Index({ unique: true })
  @Column({ unique: true })
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

  @Column({ type: String, nullable: true })
  website!: string | null;

  @Column({ type: String, nullable: true })
  logo!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => AcademicYearEntity, (ay) => ay.institution)
  academicYears!: AcademicYearEntity[];

  @OneToMany(() => DepartmentEntity, (d) => d.institution)
  departments!: DepartmentEntity[];

  @OneToMany(() => GradeClassEntity, (gc) => gc.institution)
  gradeClasses!: GradeClassEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
