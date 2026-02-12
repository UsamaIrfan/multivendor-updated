import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { Notice } from '../../domain/notice';

export abstract class NoticeRepository {
  abstract create(data: DeepPartial<Notice>): Promise<Notice>;
  abstract findAll(): Promise<Notice[]>;
  abstract findById(id: Notice['id']): Promise<NullableType<Notice>>;
  abstract update(
    id: Notice['id'],
    data: DeepPartial<Notice>,
  ): Promise<Notice | null>;
  abstract remove(id: Notice['id']): Promise<void>;
}
