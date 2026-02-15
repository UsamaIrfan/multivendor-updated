import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { AssignmentSubmission } from '../../domain/assignment-submission';

export abstract class AssignmentSubmissionRepository {
  abstract create(
    data: DeepPartial<AssignmentSubmission>,
  ): Promise<AssignmentSubmission>;
  abstract findAll(): Promise<AssignmentSubmission[]>;
  abstract findById(id: number): Promise<NullableType<AssignmentSubmission>>;
  abstract findByAssignmentId(
    assignmentId: number,
  ): Promise<AssignmentSubmission[]>;
  abstract update(
    id: number,
    payload: DeepPartial<AssignmentSubmission>,
  ): Promise<AssignmentSubmission | null>;
  abstract remove(id: number): Promise<void>;
}
