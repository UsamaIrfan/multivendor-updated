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
import {
  GenderEnum,
  BloodGroupEnum,
} from '../../../../../common/enums/general.enum';
import { StudentDocumentEntity } from './student-document.entity';
import { StudentEnrollmentEntity } from './student-enrollment.entity';
import { StudentAttendanceEntity } from './student-attendance.entity';
import { LeaveRequestEntity } from './leave-request.entity';
import { FeeChallanEntity } from './fee-challan.entity';
import { ExamResultEntity } from './exam-result.entity';

@Entity({ name: 'student' })
export class StudentEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => UserEntity, { eager: true })
  @JoinColumn()
  user!: UserEntity;

  @ManyToOne(() => InstitutionEntity, { onDelete: 'CASCADE' })
  institution!: InstitutionEntity;

  @Index({ unique: true })
  @Column({ unique: true })
  rollNumber!: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth!: Date | null;

  @Column({
    type: 'enum',
    enum: GenderEnum,
    nullable: true,
  })
  gender!: GenderEnum | null;

  @Column({ type: String, nullable: true })
  guardianName!: string | null;

  @Column({ type: String, nullable: true })
  guardianPhone!: string | null;

  @Column({ type: String, nullable: true })
  guardianEmail!: string | null;

  @Column({ type: String, nullable: true })
  guardianRelation!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ type: String, nullable: true })
  city!: string | null;

  @Column({
    type: 'enum',
    enum: BloodGroupEnum,
    nullable: true,
  })
  bloodGroup!: BloodGroupEnum | null;

  @Column({ type: String, nullable: true })
  nationality!: string | null;

  @Column({ type: String, nullable: true })
  religion!: string | null;

  @Column({ type: 'date', nullable: true })
  admissionDate!: Date | null;

  @OneToMany(() => StudentDocumentEntity, (sd) => sd.student)
  documents!: StudentDocumentEntity[];

  @OneToMany(() => StudentEnrollmentEntity, (se) => se.student)
  enrollments!: StudentEnrollmentEntity[];

  @OneToMany(() => StudentAttendanceEntity, (sa) => sa.student)
  attendances!: StudentAttendanceEntity[];

  @OneToMany(() => LeaveRequestEntity, (lr) => lr.student)
  leaveRequests!: LeaveRequestEntity[];

  @OneToMany(() => FeeChallanEntity, (fc) => fc.student)
  feeChallans!: FeeChallanEntity[];

  @OneToMany(() => ExamResultEntity, (er) => er.student)
  examResults!: ExamResultEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
