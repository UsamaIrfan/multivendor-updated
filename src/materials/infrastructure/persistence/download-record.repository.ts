import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { DownloadRecord } from '../../domain/download-record';

export abstract class DownloadRecordRepository {
  abstract create(data: DeepPartial<DownloadRecord>): Promise<DownloadRecord>;
  abstract findByMaterialId(materialId: number): Promise<DownloadRecord[]>;
  abstract countByMaterialId(materialId: number): Promise<number>;
}
