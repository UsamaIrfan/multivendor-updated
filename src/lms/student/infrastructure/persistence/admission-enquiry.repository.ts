import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { AdmissionEnquiry } from '../../domain/admission-enquiry';

export abstract class AdmissionEnquiryRepository {
  abstract create(data: DeepPartial<AdmissionEnquiry>): Promise<AdmissionEnquiry>;
  abstract findAll(): Promise<AdmissionEnquiry[]>;
  abstract findById(id: number): Promise<NullableType<AdmissionEnquiry>>;
  abstract update(
    id: number,
    payload: DeepPartial<AdmissionEnquiry>,
  ): Promise<AdmissionEnquiry | null>;
  abstract remove(id: number): Promise<void>;
}
