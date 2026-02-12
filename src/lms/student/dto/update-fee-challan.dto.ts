import { PartialType } from '@nestjs/swagger';
import { CreateFeeChallanDto } from './create-fee-challan.dto';

export class UpdateFeeChallanDto extends PartialType(CreateFeeChallanDto) {}
