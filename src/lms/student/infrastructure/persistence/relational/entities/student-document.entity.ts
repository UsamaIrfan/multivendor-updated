import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantAwareEntityHelper } from '../../../../../../utils/tenant-aware-entity-helper';
import { StudentEntity } from './student.entity';
import { FileEntity } from '../../../../../../files/infrastructure/persistence/relational/entities/file.entity';

@Entity({ name: 'student_document' })
export class StudentDocumentEntity extends TenantAwareEntityHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => StudentEntity, (s) => s.documents, { onDelete: 'CASCADE' })
  student!: StudentEntity;

  @Column()
  documentType!: string;

  @ManyToOne(() => FileEntity, { eager: true, nullable: true })
  @JoinColumn()
  file!: FileEntity | null;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ type: String, nullable: true })
  remarks!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
