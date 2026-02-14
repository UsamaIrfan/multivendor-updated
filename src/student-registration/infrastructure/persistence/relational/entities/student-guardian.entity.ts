import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantAwareEntityHelper } from '../../../../../utils/tenant-aware-entity-helper';
import { StudentEntity } from '../../../../../lms/student/infrastructure/persistence/relational/entities/student.entity';

@Entity({ name: 'student_guardian' })
export class StudentGuardianEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => StudentEntity, { onDelete: 'CASCADE' })
  student!: StudentEntity;

  @Column()
  name!: string;

  @Column()
  phone!: string;

  @Column({ type: String, nullable: true })
  email!: string | null;

  @Column()
  relation!: string;

  @Column({ default: false })
  isPrimary!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
