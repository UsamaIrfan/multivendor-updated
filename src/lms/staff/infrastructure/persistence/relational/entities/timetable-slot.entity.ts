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
import { EntityRelationalHelper } from '../../../../../../utils/relational-entity-helper';
import { SectionEntity } from '../../../../../courses/infrastructure/persistence/relational/entities/section.entity';
import { SubjectEntity } from '../../../../../courses/infrastructure/persistence/relational/entities/subject.entity';
import { StaffEntity } from './staff.entity';
import { DayOfWeekEnum } from '../../../../../common/enums/general.enum';

@Entity({ name: 'timetable_slot' })
@Index(['section', 'dayOfWeek', 'startTime'], { unique: true })
export class TimetableSlotEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => SectionEntity, { onDelete: 'CASCADE' })
  section!: SectionEntity;

  @ManyToOne(() => SubjectEntity, { eager: true })
  subject!: SubjectEntity;

  @ManyToOne(() => StaffEntity, { eager: true, nullable: true })
  staff!: StaffEntity | null;

  @Column({
    type: 'enum',
    enum: DayOfWeekEnum,
  })
  dayOfWeek!: DayOfWeekEnum;

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
