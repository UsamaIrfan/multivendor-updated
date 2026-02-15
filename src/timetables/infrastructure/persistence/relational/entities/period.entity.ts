import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantAwareEntityHelper } from '../../../../../utils/tenant-aware-entity-helper';
import { TimetableEntity } from './timetable.entity';

@Entity({ name: 'periods' })
@Index(['tenantId', 'teacherId', 'dayOfWeek', 'startTime'])
export class PeriodEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => TimetableEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'timetableId' })
  timetable!: TimetableEntity;

  @Index()
  @Column({ type: 'uuid' })
  timetableId!: string;

  @Column({ type: 'uuid' })
  subjectId!: string;

  @Index()
  @Column({ type: 'uuid' })
  teacherId!: string;

  @Column({ type: 'int' })
  dayOfWeek!: number;

  @Column({ type: 'time' })
  startTime!: string;

  @Column({ type: 'time' })
  endTime!: string;

  @Column({ type: String, nullable: true })
  room!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
