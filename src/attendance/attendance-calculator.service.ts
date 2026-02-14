import { Injectable } from '@nestjs/common';
import { AttendanceStatusEnum } from '../lms/common/enums/attendance-status.enum';

interface AttendanceRecord {
  status: AttendanceStatusEnum;
  date?: Date;
}

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  leaveDays: number;
  percentage: number;
}

@Injectable()
export class AttendanceCalculatorService {
  /**
   * Calculate attendance percentage.
   * - present, late, excused count as 1.0
   * - half_day counts as 0.5
   * - absent counts as 0
   */
  calculatePercentage(records: AttendanceRecord[]): number {
    if (records.length === 0) return 0;

    let effectivePresent = 0;
    for (const r of records) {
      switch (r.status) {
        case AttendanceStatusEnum.present:
        case AttendanceStatusEnum.late:
        case AttendanceStatusEnum.excused:
          effectivePresent += 1;
          break;
        case AttendanceStatusEnum.half_day:
          effectivePresent += 0.5;
          break;
        case AttendanceStatusEnum.absent:
        default:
          break;
      }
    }

    const pct = (effectivePresent / records.length) * 100;
    return Math.round(pct * 100) / 100;
  }

  /**
   * Calculate a summary breakdown of attendance records.
   */
  calculateSummary(records: AttendanceRecord[]): AttendanceSummary {
    const summary: AttendanceSummary = {
      totalDays: records.length,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      halfDays: 0,
      leaveDays: 0,
      percentage: 0,
    };

    for (const r of records) {
      switch (r.status) {
        case AttendanceStatusEnum.present:
          summary.presentDays++;
          break;
        case AttendanceStatusEnum.absent:
          summary.absentDays++;
          break;
        case AttendanceStatusEnum.late:
          summary.lateDays++;
          break;
        case AttendanceStatusEnum.half_day:
          summary.halfDays++;
          break;
        case AttendanceStatusEnum.excused:
          summary.leaveDays++;
          break;
      }
    }

    summary.percentage = this.calculatePercentage(records);
    return summary;
  }
}
