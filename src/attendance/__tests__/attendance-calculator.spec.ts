import { AttendanceCalculatorService } from '../attendance-calculator.service';
import { AttendanceStatusEnum } from '../../lms/common/enums/attendance-status.enum';

describe('AttendanceCalculatorService', () => {
  let calculator: AttendanceCalculatorService;

  beforeEach(() => {
    calculator = new AttendanceCalculatorService();
  });

  describe('calculatePercentage', () => {
    it('should calculate correct percentage for all present', () => {
      const records = [
        { status: AttendanceStatusEnum.present },
        { status: AttendanceStatusEnum.present },
        { status: AttendanceStatusEnum.present },
      ];
      expect(calculator.calculatePercentage(records as any)).toBe(100);
    });

    it('should calculate 0% when all absent', () => {
      const records = [
        { status: AttendanceStatusEnum.absent },
        { status: AttendanceStatusEnum.absent },
      ];
      expect(calculator.calculatePercentage(records as any)).toBe(0);
    });

    it('should count half_day as 0.5', () => {
      const records = [
        { status: AttendanceStatusEnum.present },
        { status: AttendanceStatusEnum.half_day },
      ];
      // effective present = 1 + 0.5 = 1.5 out of 2 = 75%
      expect(calculator.calculatePercentage(records as any)).toBe(75);
    });

    it('should count late as present', () => {
      const records = [
        { status: AttendanceStatusEnum.late },
        { status: AttendanceStatusEnum.present },
      ];
      expect(calculator.calculatePercentage(records as any)).toBe(100);
    });

    it('should round to 2 decimal places', () => {
      const records = [
        { status: AttendanceStatusEnum.present },
        { status: AttendanceStatusEnum.present },
        { status: AttendanceStatusEnum.absent },
      ];
      // 2/3 = 66.67%
      expect(calculator.calculatePercentage(records as any)).toBe(66.67);
    });

    it('should return 0 for empty records (zero working days)', () => {
      expect(calculator.calculatePercentage([])).toBe(0);
    });

    it('should handle excused as approved leave (count as present)', () => {
      const records = [
        { status: AttendanceStatusEnum.present },
        { status: AttendanceStatusEnum.excused },
      ];
      expect(calculator.calculatePercentage(records as any)).toBe(100);
    });

    it('should handle mixed statuses', () => {
      const records = [
        { status: AttendanceStatusEnum.present },
        { status: AttendanceStatusEnum.absent },
        { status: AttendanceStatusEnum.late },
        { status: AttendanceStatusEnum.half_day },
        { status: AttendanceStatusEnum.excused },
      ];
      // present=1, late=1 (full), half_day=0.5, excused=1 (full), absent=0
      // effective = 3.5 / 5 = 70%
      expect(calculator.calculatePercentage(records as any)).toBe(70);
    });
  });

  describe('calculateSummary', () => {
    it('should return correct counts for each status', () => {
      const records = [
        { status: AttendanceStatusEnum.present, date: new Date('2025-12-01') },
        { status: AttendanceStatusEnum.present, date: new Date('2025-12-02') },
        { status: AttendanceStatusEnum.absent, date: new Date('2025-12-03') },
        { status: AttendanceStatusEnum.late, date: new Date('2025-12-04') },
        { status: AttendanceStatusEnum.half_day, date: new Date('2025-12-05') },
        { status: AttendanceStatusEnum.excused, date: new Date('2025-12-06') },
      ];

      const summary = calculator.calculateSummary(records as any);

      expect(summary.totalDays).toBe(6);
      expect(summary.presentDays).toBe(2);
      expect(summary.absentDays).toBe(1);
      expect(summary.lateDays).toBe(1);
      expect(summary.halfDays).toBe(1);
      expect(summary.leaveDays).toBe(1);
      expect(summary.percentage).toBeGreaterThan(0);
    });

    it('should return zero summary for empty records', () => {
      const summary = calculator.calculateSummary([]);

      expect(summary.totalDays).toBe(0);
      expect(summary.presentDays).toBe(0);
      expect(summary.absentDays).toBe(0);
      expect(summary.percentage).toBe(0);
    });

    it('should return 100% for all present', () => {
      const records = [
        { status: AttendanceStatusEnum.present, date: new Date('2025-12-01') },
        { status: AttendanceStatusEnum.present, date: new Date('2025-12-02') },
      ];

      const summary = calculator.calculateSummary(records as any);

      expect(summary.percentage).toBe(100);
    });
  });
});
