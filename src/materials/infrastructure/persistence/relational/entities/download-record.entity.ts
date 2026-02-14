import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { MaterialEntity } from './material.entity';

@Entity({ name: 'download_record' })
@Index(['tenantId', 'materialId'])
export class DownloadRecordEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => MaterialEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'materialId' })
  material!: MaterialEntity;

  @Column({ type: 'int' })
  materialId!: number;

  @Column({ type: 'int' })
  userId!: number;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  downloadedAt!: Date;
}
