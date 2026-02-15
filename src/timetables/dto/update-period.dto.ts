import { PartialType } from '@nestjs/swagger';
import { AddPeriodDto } from './add-period.dto';

export class UpdatePeriodDto extends PartialType(AddPeriodDto) {}
