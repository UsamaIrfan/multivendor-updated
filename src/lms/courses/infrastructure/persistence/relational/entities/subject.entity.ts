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
import { DepartmentEntity } from './department.entity';

@Entity({ name: 'subject' })
@Index(['department', 'code'], { unique: true })
export class SubjectEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => DepartmentEntity, (d) => d.subjects, {
    onDelete: 'CASCADE',
  })
  department!: DepartmentEntity;

  @Column()
  name!: string;

  @Column()
  code!: string;

  @Column({ type: 'int', default: 0 })
  creditHours!: number;

  @Column({ type: String, nullable: true })
  description!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
