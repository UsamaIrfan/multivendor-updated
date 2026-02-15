import { PartialType } from '@nestjs/swagger';
import { CreateStaffMgmtDto } from './create-staff-mgmt.dto';

export class UpdateStaffMgmtDto extends PartialType(CreateStaffMgmtDto) {}
