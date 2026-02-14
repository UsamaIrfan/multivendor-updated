import { Injectable } from '@nestjs/common';

export interface GradeDefinition {
  minPercentage: number;
  maxPercentage: number;
  grade: string;
  gradePoint: number;
  description?: string;
}

export interface GradeResult {
  grade: string;
  gradePoint: number;
}

export interface SubjectResultInput {
  marksObtained: number | null;
  totalMarks: number;
  isAbsent: boolean;
}

@Injectable()
export class GradeCalculatorService {
  /**
   * Calculate percentage from marks obtained and total marks.
   */
  calculatePercentage(marksObtained: number, totalMarks: number): number {
    if (totalMarks === 0) return 0;
    return Math.round((marksObtained / totalMarks) * 10000) / 100;
  }

  /**
   * Determine grade from percentage using a grading scale.
   */
  calculateGrade(
    percentage: number,
    gradingScale: GradeDefinition[],
  ): GradeResult {
    // Sort descending by minPercentage for deterministic matching
    const sorted = [...gradingScale].sort(
      (a, b) => b.minPercentage - a.minPercentage,
    );

    for (const def of sorted) {
      if (percentage >= def.minPercentage && percentage <= def.maxPercentage) {
        return { grade: def.grade, gradePoint: def.gradePoint };
      }
    }

    // Fallback: lowest grade
    const lowest = sorted[sorted.length - 1];
    return { grade: lowest.grade, gradePoint: lowest.gradePoint };
  }

  /**
   * Calculate overall weighted percentage across multiple subjects.
   */
  calculateOverallPercentage(subjects: SubjectResultInput[]): number {
    if (subjects.length === 0) return 0;

    const totalMarks = subjects.reduce((sum, s) => sum + s.totalMarks, 0);
    const obtainedMarks = subjects.reduce(
      (sum, s) => sum + (s.isAbsent ? 0 : (s.marksObtained ?? 0)),
      0,
    );

    if (totalMarks === 0) return 0;
    return Math.round((obtainedMarks / totalMarks) * 10000) / 100;
  }

  /**
   * Check if a student passed a subject.
   */
  isPassed(
    marksObtained: number | null,
    passingMarks: number,
    isAbsent?: boolean,
  ): boolean {
    if (isAbsent) return false;
    if (marksObtained === null) return false;
    return marksObtained >= passingMarks;
  }
}
