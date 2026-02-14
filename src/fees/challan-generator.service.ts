import { Injectable } from '@nestjs/common';
import { FeeChallanRepository } from '../lms/student/infrastructure/persistence/fee-challan.repository';

@Injectable()
export class ChallanGeneratorService {
  constructor(private readonly challanRepo: FeeChallanRepository) {}

  /**
   * Generate a unique challan number in format CH-YYYY-XXXXXX.
   * Uses the repo to find the last challan for the current year
   * and increments sequentially.
   */
  async generate(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `CH-${currentYear}-`;

    const lastNumber = await this.getLastSequenceForYear(currentYear);
    const nextSeq = lastNumber + 1;

    return `${prefix}${String(nextSeq).padStart(6, '0')}`;
  }

  private async getLastSequenceForYear(year: number): Promise<number> {
    const last = await this.challanRepo.getLastChallanNumberForYear(year);
    if (last) {
      const parts = last.split('-');
      return parseInt(parts[2], 10);
    }
    return 0;
  }
}
