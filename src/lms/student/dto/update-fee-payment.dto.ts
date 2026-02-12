import { PartialType } from '@nestjs/swagger';
import { CreateFeePaymentDto } from './create-fee-payment.dto';

export class UpdateFeePaymentDto extends PartialType(CreateFeePaymentDto) {}
