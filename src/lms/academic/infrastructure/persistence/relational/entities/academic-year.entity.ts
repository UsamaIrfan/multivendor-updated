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
import { InstitutionEntity } from '../../../../../courses/infrastructure/persistence/relational/entities/institution.entity';
import { TermEntity } from './term.entity';

@Entity({ name: 'academic_year' })
@Index(['institution', 'name'], { unique: true })
export class AcademicYearEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => InstitutionEntity, (i) => i.academicYears, {
    onDelete: 'CASCADE',
  })
  institution!: InstitutionEntity;

  @Column()
  name!: string;

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date' })
  endDate!: Date;

  @Column({ default: false })
  isCurrent!: boolean;

  @OneToMany(() => TermEntity, (t) => t.academicYear)
  terms!: TermEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
