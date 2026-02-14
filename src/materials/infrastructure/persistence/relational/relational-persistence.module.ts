import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialEntity } from './entities/material.entity';
import { AssignmentEntity } from './entities/assignment.entity';
import { AssignmentSubmissionEntity } from './entities/assignment-submission.entity';
import { DownloadRecordEntity } from './entities/download-record.entity';
import { CourseMaterialRepository } from '../course-material.repository';
import { MaterialRelationalRepository } from './repositories/material.repository';
import { AssignmentRepository } from '../assignment.repository';
import { AssignmentRelationalRepository } from './repositories/assignment.repository';
import { AssignmentSubmissionRepository } from '../assignment-submission.repository';
import { AssignmentSubmissionRelationalRepository } from './repositories/assignment-submission.repository';
import { DownloadRecordRepository } from '../download-record.repository';
import { DownloadRecordRelationalRepository } from './repositories/download-record.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaterialEntity,
      AssignmentEntity,
      AssignmentSubmissionEntity,
      DownloadRecordEntity,
    ]),
  ],
  providers: [
    {
      provide: CourseMaterialRepository,
      useClass: MaterialRelationalRepository,
    },
    {
      provide: AssignmentRepository,
      useClass: AssignmentRelationalRepository,
    },
    {
      provide: AssignmentSubmissionRepository,
      useClass: AssignmentSubmissionRelationalRepository,
    },
    {
      provide: DownloadRecordRepository,
      useClass: DownloadRecordRelationalRepository,
    },
  ],
  exports: [
    CourseMaterialRepository,
    AssignmentRepository,
    AssignmentSubmissionRepository,
    DownloadRecordRepository,
  ],
})
export class MaterialsRelationalPersistenceModule {}
