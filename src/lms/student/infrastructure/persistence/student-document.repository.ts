import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { StudentDocument } from '../../domain/student-document';

export abstract class StudentDocumentRepository {
  abstract create(data: DeepPartial<StudentDocument>): Promise<StudentDocument>;
  abstract findAll(): Promise<StudentDocument[]>;
  abstract findById(id: number): Promise<NullableType<StudentDocument>>;
  abstract update(
    id: number,
    payload: DeepPartial<StudentDocument>,
  ): Promise<StudentDocument | null>;
  abstract remove(id: number): Promise<void>;
}
