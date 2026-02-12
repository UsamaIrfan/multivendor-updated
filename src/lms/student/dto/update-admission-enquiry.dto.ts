import { PartialType } from '@nestjs/swagger';
import { CreateAdmissionEnquiryDto } from './create-admission-enquiry.dto';

export class UpdateAdmissionEnquiryDto extends PartialType(
  CreateAdmissionEnquiryDto,
) {}
