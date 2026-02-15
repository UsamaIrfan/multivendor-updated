import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { Notice } from '../../domain/notice';

export interface FindMyNoticesOptions {
  userBranches: string[];
  userRoles: string[];
}

export abstract class NoticesRepository {
  abstract create(data: DeepPartial<Notice>): Promise<Notice>;

  abstract findAll(): Promise<Notice[]>;

  abstract findById(id: Notice['id']): Promise<NullableType<Notice>>;

  abstract findByBranch(branchId: string): Promise<Notice[]>;

  abstract findMyNotices(options: FindMyNoticesOptions): Promise<Notice[]>;

  abstract update(
    id: Notice['id'],
    data: DeepPartial<Notice>,
  ): Promise<Notice | null>;

  abstract remove(id: Notice['id']): Promise<void>;
}
