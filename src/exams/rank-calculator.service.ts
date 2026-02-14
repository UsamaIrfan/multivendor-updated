import { Injectable } from '@nestjs/common';

export interface StudentResultForRanking {
  studentId: number;
  percentage: number;
}

export interface RankedStudentResult extends StudentResultForRanking {
  rank: number;
}

@Injectable()
export class RankCalculatorService {
  /**
   * Assign ranks based on percentage in descending order.
   * Equal percentages receive the same rank (dense ranking with gaps).
   * Example: 92, 85, 85, 78 → ranks 1, 2, 2, 4
   */
  calculateRanks(results: StudentResultForRanking[]): RankedStudentResult[] {
    if (results.length === 0) return [];

    const sorted = [...results].sort((a, b) => b.percentage - a.percentage);

    const ranked: RankedStudentResult[] = [];
    let currentRank = 1;

    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i].percentage < sorted[i - 1].percentage) {
        currentRank = i + 1;
      }
      ranked.push({ ...sorted[i], rank: currentRank });
    }

    return ranked;
  }
}
