import {
  RankCalculatorService,
  StudentResultForRanking,
} from '../rank-calculator.service';

describe('RankCalculatorService', () => {
  let service: RankCalculatorService;

  beforeEach(() => {
    service = new RankCalculatorService();
  });

  describe('calculateRanks', () => {
    it('should rank students by percentage descending', () => {
      const results: StudentResultForRanking[] = [
        { studentId: 1, percentage: 85 },
        { studentId: 2, percentage: 92 },
        { studentId: 3, percentage: 78 },
      ];

      const ranked = service.calculateRanks(results);
      expect(ranked).toEqual([
        { studentId: 2, percentage: 92, rank: 1 },
        { studentId: 1, percentage: 85, rank: 2 },
        { studentId: 3, percentage: 78, rank: 3 },
      ]);
    });

    it('should assign same rank for equal percentages', () => {
      const results: StudentResultForRanking[] = [
        { studentId: 1, percentage: 85 },
        { studentId: 2, percentage: 85 },
        { studentId: 3, percentage: 78 },
      ];

      const ranked = service.calculateRanks(results);
      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].rank).toBe(1);
      expect(ranked[2].rank).toBe(3); // skip rank 2
    });

    it('should handle single student', () => {
      const results: StudentResultForRanking[] = [
        { studentId: 1, percentage: 90 },
      ];

      const ranked = service.calculateRanks(results);
      expect(ranked[0].rank).toBe(1);
    });

    it('should handle empty array', () => {
      const ranked = service.calculateRanks([]);
      expect(ranked).toEqual([]);
    });

    it('should rank all students with same percentage as rank 1', () => {
      const results: StudentResultForRanking[] = [
        { studentId: 1, percentage: 80 },
        { studentId: 2, percentage: 80 },
        { studentId: 3, percentage: 80 },
      ];

      const ranked = service.calculateRanks(results);
      expect(ranked.every((r) => r.rank === 1)).toBe(true);
    });
  });
});
