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
import { TenantAwareEntityHelper } from '../../../../../../utils/tenant-aware-entity-helper';
import { GradeClassEntity } from './grade-class.entity';

@Entity({ name: 'section' })
@Index(['gradeClass', 'name'], { unique: true })
export class SectionEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => GradeClassEntity, (gc) => gc.sections, {
    onDelete: 'CASCADE',
  })
  gradeClass!: GradeClassEntity;

  @Column({ type: 'int', nullable: true })
  classTeacherId!: number | null;

  @Column()
  name!: string;

  @Column({ type: 'int', default: 40 })
  capacity!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
