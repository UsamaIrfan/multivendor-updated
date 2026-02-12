import { PartialType } from '@nestjs/swagger';
import { CreateStaffAttendanceDto } from './create-staff-attendance.dto';

export class UpdateStaffAttendanceDto extends PartialType(
  CreateStaffAttendanceDto,
) {}
