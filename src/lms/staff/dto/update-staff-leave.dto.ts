import { PartialType } from '@nestjs/swagger';
import { CreateStaffLeaveDto } from './create-staff-leave.dto';

export class UpdateStaffLeaveDto extends PartialType(CreateStaffLeaveDto) {}
