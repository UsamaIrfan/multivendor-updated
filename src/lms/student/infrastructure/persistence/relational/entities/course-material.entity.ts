import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../../utils/relational-entity-helper';
import { SubjectEntity } from '../../../../../courses/infrastructure/persistence/relational/entities/subject.entity';
import { CourseMaterialTypeEnum } from '../../../../../common/enums/general.enum';
import { FileEntity } from '../../../../../../files/infrastructure/persistence/relational/entities/file.entity';

@Entity({ name: 'course_material' })
export class CourseMaterialEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => SubjectEntity, { onDelete: 'CASCADE' })
  subject!: SubjectEntity;

  @Column({ type: 'int', nullable: true })
  uploadedById!: number | null;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    type: 'enum',
    enum: CourseMaterialTypeEnum,
    default: CourseMaterialTypeEnum.document,
  })
  type!: CourseMaterialTypeEnum;

  @ManyToOne(() => FileEntity, { eager: true, nullable: true })
  @JoinColumn()
  file!: FileEntity | null;

  @Column({ type: String, nullable: true })
  externalUrl!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
