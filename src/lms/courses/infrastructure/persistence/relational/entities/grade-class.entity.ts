import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../../utils/relational-entity-helper';
import { InstitutionEntity } from './institution.entity';
import { SectionEntity } from './section.entity';

@Entity({ name: 'grade_class' })
@Index(['institution', 'name'], { unique: true })
export class GradeClassEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => InstitutionEntity, (i) => i.gradeClasses, {
    onDelete: 'CASCADE',
  })
  institution!: InstitutionEntity;

  @Column()
  name!: string;

  @Column({ type: 'int', nullable: true })
  numericGrade!: number | null;

  @Column({ type: String, nullable: true })
  description!: string | null;

  @OneToMany(() => SectionEntity, (s) => s.gradeClass)
  sections!: SectionEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
