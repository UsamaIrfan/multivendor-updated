import { Module } from '@nestjs/common';
import { MaterialsRelationalPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { MaterialsService } from './materials.service';
import {
  MaterialsController,
  AssignmentsController,
  SubmissionsController,
} from './materials.controller';

@Module({
  imports: [MaterialsRelationalPersistenceModule],
  controllers: [
    MaterialsController,
    AssignmentsController,
    SubmissionsController,
  ],
  providers: [MaterialsService],
  exports: [MaterialsService],
})
export class MaterialsModule {}
