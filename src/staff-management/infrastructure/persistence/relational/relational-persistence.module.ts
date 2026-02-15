import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffMgmtEntity } from './entities/staff-mgmt.entity';
import { StaffBranchAssignmentEntity } from './entities/staff-branch-assignment.entity';
import { StaffMgmtRepository } from '../staff-mgmt.repository';
import { StaffMgmtRelationalRepository } from './repositories/staff-mgmt.repository';
import { StaffBranchAssignmentRepository } from '../staff-branch-assignment.repository';
import { StaffBranchAssignmentRelationalRepository } from './repositories/staff-branch-assignment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([StaffMgmtEntity, StaffBranchAssignmentEntity]),
  ],
  providers: [
    {
      provide: StaffMgmtRepository,
      useClass: StaffMgmtRelationalRepository,
    },
    {
      provide: StaffBranchAssignmentRepository,
      useClass: StaffBranchAssignmentRelationalRepository,
    },
  ],
  exports: [StaffMgmtRepository, StaffBranchAssignmentRepository],
})
export class StaffManagementRelationalPersistenceModule {}
