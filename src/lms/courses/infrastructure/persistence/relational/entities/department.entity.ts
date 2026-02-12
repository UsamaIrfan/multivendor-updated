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
import { SubjectEntity } from './subject.entity';

@Entity({ name: 'department' })
@Index(['institution', 'code'], { unique: true })
export class DepartmentEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => InstitutionEntity, (i) => i.departments, {
    onDelete: 'CASCADE',
  })
  institution!: InstitutionEntity;

  @Column()
  name!: string;

  @Column()
  code!: string;

  @Column({ type: String, nullable: true })
  description!: string | null;

  @OneToMany(() => SubjectEntity, (s) => s.department)
  subjects!: SubjectEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
