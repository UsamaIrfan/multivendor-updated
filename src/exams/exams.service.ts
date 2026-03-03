import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ExamRepository } from '../lms/student/infrastructure/persistence/exam.repository';
import { ExamSubjectRepository } from '../lms/student/infrastructure/persistence/exam-subject.repository';
import { ExamResultRepository } from '../lms/student/infrastructure/persistence/exam-result.repository';
import { GradingScaleRepository } from './infrastructure/persistence/grading-scale.repository';
import { StudentRepository } from '../lms/student/infrastructure/persistence/student.repository';
import { SubjectRepository } from '../lms/courses/infrastructure/persistence/subject.repository';
import { GradeCalculatorService } from './grade-calculator.service';
import { RankCalculatorService } from './rank-calculator.service';
import { ExamStatusEnum } from '../lms/common/enums/exam-status.enum';

// ── Interfaces for method params ──

interface CreateGradingScaleParams {
  name: string;
  grades: Array<{
    minPercentage: number;
    maxPercentage: number;
    grade: string;
    gradePoint: number;
    description?: string;
  }>;
}

interface CreateExamScheduleParams {
  termId: number;
  name: string;
  type?: string;
  startDate: string;
  endDate: string;
  description?: string;
  subjects?: Array<{
    subjectId: number;
    examDate?: string;
    totalMarks: number;
    passingMarks: number;
  }>;
}

interface EnterMarksParams {
  examSubjectId: number;
  results: Array<{
    studentId: number;
    marksObtained?: number | null;
    isAbsent?: boolean;
    remarks?: string;
  }>;
}

interface BulkImportParams {
  examSubjectId: number;
  data: Array<{
    studentId: number;
    marksObtained?: number | null;
  }>;
}

interface PublishResultsParams {
  examId: number;
  gradingScaleId: number;
}

@Injectable()
export class ExamsService {
  constructor(
    private readonly examRepo: ExamRepository,
    private readonly examSubjectRepo: ExamSubjectRepository,
    private readonly examResultRepo: ExamResultRepository,
    private readonly gradingScaleRepo: GradingScaleRepository,
    private readonly studentRepo: StudentRepository,
    private readonly subjectRepo: SubjectRepository,
    private readonly gradeCalculator: GradeCalculatorService,
    private readonly rankCalculator: RankCalculatorService,
  ) {}

  // ────────── Grading Scales ──────────

  async createGradingScale(dto: CreateGradingScaleParams) {
    // Check for duplicate name
    const existing = await this.gradingScaleRepo.findByName(dto.name);
    if (existing) {
      throw new ConflictException(
        'Grading scale with this name already exists',
      );
    }

    // Validate no overlapping ranges
    this.validateGradeRanges(dto.grades);

    return this.gradingScaleRepo.create({
      name: dto.name,
      grades: dto.grades,
    });
  }

  async getAllGradingScales() {
    return this.gradingScaleRepo.findAll();
  }

  async getGradingScale(id: number) {
    const scale = await this.gradingScaleRepo.findById(id);
    if (!scale) {
      throw new NotFoundException('Grading scale not found');
    }
    return scale;
  }

  // ────────── Exam Schedule ──────────

  async createExamSchedule(dto: CreateExamScheduleParams) {
    // Validate dates
    if (new Date(dto.endDate) < new Date(dto.startDate)) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: { endDate: 'endDate must be after startDate' },
      });
    }

    const exam = await this.examRepo.create({
      termId: dto.termId,
      name: dto.name,
      type: dto.type as any,
      status: ExamStatusEnum.scheduled,
      startDate: new Date(dto.startDate) as any,
      endDate: new Date(dto.endDate) as any,
      description: dto.description ?? null,
    });

    const subjects: any[] = [];
    if (dto.subjects && dto.subjects.length > 0) {
      for (const sub of dto.subjects) {
        const examSubject = await this.examSubjectRepo.create({
          examId: exam.id,
          subjectId: sub.subjectId,
          examDate: sub.examDate ? (new Date(sub.examDate) as any) : null,
          totalMarks: sub.totalMarks,
          passingMarks: sub.passingMarks,
        });
        subjects.push(examSubject);
      }
    }

    return {
      ...exam,
      subjects,
    };
  }

  async getExamSchedule(id: number) {
    const exam = await this.examRepo.findById(id);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const subjects = await this.examSubjectRepo.findByExamId(id);
    return { ...exam, subjects };
  }

  async updateExamStatus(id: number, status: ExamStatusEnum) {
    const exam = await this.examRepo.findById(id);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const updated = await this.examRepo.update(id, { status });
    return updated;
  }

  // ────────── Marks Entry ──────────

  async enterMarks(dto: EnterMarksParams) {
    const examSubject = await this.examSubjectRepo.findById(dto.examSubjectId);
    if (!examSubject) {
      throw new NotFoundException('Exam subject not found');
    }

    // Validate marks
    for (const r of dto.results) {
      if (r.marksObtained !== undefined && r.marksObtained !== null) {
        if (r.marksObtained < 0) {
          throw new UnprocessableEntityException({
            status: 422,
            errors: {
              marks: `Marks cannot be negative for student ${r.studentId}`,
            },
          });
        }
        if (r.marksObtained > examSubject.totalMarks) {
          throw new UnprocessableEntityException({
            status: 422,
            errors: {
              marks: `Marks (${r.marksObtained}) exceed total marks (${examSubject.totalMarks}) for student ${r.studentId}`,
            },
          });
        }
      }
    }

    let entered = 0;
    for (const r of dto.results) {
      // Check if result already exists (upsert)
      const existing =
        await this.examResultRepo.findByExamSubjectIdAndStudentId(
          dto.examSubjectId,
          r.studentId,
        );

      if (existing) {
        await this.examResultRepo.update(existing.id, {
          marksObtained: r.marksObtained ?? null,
          isAbsent: r.isAbsent ?? false,
          remarks: r.remarks ?? null,
        });
      } else {
        await this.examResultRepo.create({
          examSubjectId: dto.examSubjectId,
          studentId: r.studentId,
          marksObtained: r.marksObtained ?? null,
          isAbsent: r.isAbsent ?? false,
          remarks: r.remarks ?? null,
          grade: null,
          percentage: null,
          rank: null,
        });
      }
      entered++;
    }

    return { entered };
  }

  async bulkImportMarks(dto: BulkImportParams) {
    const examSubject = await this.examSubjectRepo.findById(dto.examSubjectId);
    if (!examSubject) {
      throw new NotFoundException('Exam subject not found');
    }

    // Validate marks
    for (const d of dto.data) {
      if (d.marksObtained !== undefined && d.marksObtained !== null) {
        if (d.marksObtained < 0 || d.marksObtained > examSubject.totalMarks) {
          throw new UnprocessableEntityException({
            status: 422,
            errors: {
              marks: `Invalid marks for student ${d.studentId}`,
            },
          });
        }
      }
    }

    let imported = 0;
    for (const d of dto.data) {
      const existing =
        await this.examResultRepo.findByExamSubjectIdAndStudentId(
          dto.examSubjectId,
          d.studentId,
        );

      if (existing) {
        await this.examResultRepo.update(existing.id, {
          marksObtained: d.marksObtained ?? null,
          isAbsent: false,
        });
      } else {
        await this.examResultRepo.create({
          examSubjectId: dto.examSubjectId,
          studentId: d.studentId,
          marksObtained: d.marksObtained ?? null,
          isAbsent: false,
          grade: null,
          percentage: null,
          rank: null,
        });
      }
      imported++;
    }

    return { imported };
  }

  async getMarksForExamSubject(examSubjectId: number) {
    const examSubject = await this.examSubjectRepo.findById(examSubjectId);
    if (!examSubject) {
      throw new NotFoundException('Exam subject not found');
    }
    return this.examResultRepo.findByExamSubjectId(examSubjectId);
  }

  // ────────── Result Publication ──────────

  async publishResults(dto: PublishResultsParams) {
    const exam = await this.examRepo.findById(dto.examId);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    if (exam.status === ExamStatusEnum.results_published) {
      throw new ConflictException(
        'Results are already published for this exam',
      );
    }

    const gradingScale = await this.gradingScaleRepo.findById(
      dto.gradingScaleId,
    );
    if (!gradingScale) {
      throw new NotFoundException('Grading scale not found');
    }

    const subjects = await this.examSubjectRepo.findByExamId(dto.examId);

    // Collect all student IDs across all subjects
    const studentPercentages = new Map<
      number,
      Array<{
        marksObtained: number | null;
        totalMarks: number;
        isAbsent: boolean;
      }>
    >();

    let totalResults = 0;

    for (const subject of subjects) {
      const results = await this.examResultRepo.findByExamSubjectId(subject.id);

      for (const result of results) {
        // Calculate percentage per subject
        const marks = result.isAbsent ? 0 : (result.marksObtained ?? 0);
        const percentage = this.gradeCalculator.calculatePercentage(
          marks,
          subject.totalMarks,
        );
        const { grade } = this.gradeCalculator.calculateGrade(
          percentage,
          gradingScale.grades,
        );

        await this.examResultRepo.update(result.id, {
          grade,
          percentage,
        });

        // Accumulate for overall percentage
        if (!studentPercentages.has(result.studentId)) {
          studentPercentages.set(result.studentId, []);
        }
        studentPercentages.get(result.studentId)!.push({
          marksObtained: result.marksObtained,
          totalMarks: subject.totalMarks,
          isAbsent: result.isAbsent,
        });

        totalResults++;
      }
    }

    // Calculate overall percentage per student and rank
    const studentOverallResults = Array.from(studentPercentages.entries()).map(
      ([studentId, subjectResults]) => ({
        studentId,
        percentage:
          this.gradeCalculator.calculateOverallPercentage(subjectResults),
      }),
    );

    const ranked = this.rankCalculator.calculateRanks(studentOverallResults);

    // Update ranks in results
    for (const rankedStudent of ranked) {
      // Get all results for this student in this exam and update rank
      for (const subject of subjects) {
        const result =
          await this.examResultRepo.findByExamSubjectIdAndStudentId(
            subject.id,
            rankedStudent.studentId,
          );
        if (result) {
          await this.examResultRepo.update(result.id, {
            rank: rankedStudent.rank,
          });
        }
      }
    }

    // Update exam status
    await this.examRepo.update(dto.examId, {
      status: ExamStatusEnum.results_published,
    });

    return {
      published: true,
      status: ExamStatusEnum.results_published,
      totalResults,
    };
  }

  // ────────── Student Results ──────────

  async getStudentResults(studentId: number) {
    // Get all exam results for this student
    const allResults = await this.examResultRepo.findByStudentId(studentId);
    if (allResults.length === 0) return [];

    // Collect unique examSubjectIds and load exam subjects
    const examSubjectIds = [
      ...new Set(allResults.map((r) => r.examSubjectId)),
    ];
    const examSubjectMap = new Map<
      number,
      { examId: number; subjectId: number; totalMarks: number; passingMarks: number }
    >();
    const examIds = new Set<number>();

    for (const esId of examSubjectIds) {
      const es = await this.examSubjectRepo.findById(esId);
      if (es) {
        examSubjectMap.set(esId, es);
        examIds.add(es.examId);
      }
    }

    // Load all exams
    const examMap = new Map<number, { id: number; name: string; type: string; status: string }>();
    for (const eid of examIds) {
      const exam = await this.examRepo.findById(eid);
      if (exam) {
        examMap.set(eid, exam);
      }
    }

    // Load subject names
    const subjectIds = [
      ...new Set([...examSubjectMap.values()].map((es) => es.subjectId)),
    ];
    const subjectNameMap = new Map<number, string>();
    for (const sid of subjectIds) {
      const subject = await this.subjectRepo.findById(sid);
      if (subject) {
        subjectNameMap.set(sid, subject.name);
      }
    }

    // Group results by examId
    const examResultsMap = new Map<
      number,
      Array<{
        result: (typeof allResults)[0];
        examSubject: NonNullable<ReturnType<typeof examSubjectMap.get>>;
      }>
    >();

    for (const result of allResults) {
      const examSubject = examSubjectMap.get(result.examSubjectId);
      if (!examSubject) continue;

      const examId = examSubject.examId;
      if (!examResultsMap.has(examId)) {
        examResultsMap.set(examId, []);
      }
      examResultsMap.get(examId)!.push({ result, examSubject });
    }

    // Build aggregated per-exam results
    const aggregated: any[] = [];

    for (const [examId, entries] of examResultsMap.entries()) {
      const exam = examMap.get(examId);
      if (!exam) continue;

      let totalMarks = 0;
      let obtainedMarks = 0;
      const subjects: any[] = [];

      for (const { result, examSubject } of entries) {
        const marks = result.isAbsent ? 0 : (result.marksObtained ?? 0);
        totalMarks += examSubject.totalMarks;
        obtainedMarks += marks;

        subjects.push({
          subjectId: examSubject.subjectId,
          subjectName:
            subjectNameMap.get(examSubject.subjectId) ??
            `Subject #${examSubject.subjectId}`,
          totalMarks: examSubject.totalMarks,
          passingMarks: examSubject.passingMarks,
          marksObtained: result.marksObtained,
          percentage: result.percentage,
          grade: result.grade,
          isAbsent: result.isAbsent,
          remarks: result.remarks,
          status: result.isAbsent
            ? 'absent'
            : (result.marksObtained ?? 0) >= examSubject.passingMarks
              ? 'pass'
              : 'fail',
        });
      }

      const percentage =
        totalMarks > 0
          ? Math.round((obtainedMarks / totalMarks) * 100 * 100) / 100
          : 0;
      const overallGrade =
        entries[0]?.result.grade ?? '-';
      // Rank is consistent across subjects for the same student in the same exam
      const rank = entries[0]?.result.rank ?? null;

      const isPassed = subjects.every(
        (s: any) => s.status === 'pass' || s.status === 'absent',
      );

      aggregated.push({
        examId,
        examName: exam.name,
        examType: exam.type,
        totalMarks,
        marksObtained: obtainedMarks,
        percentage,
        grade: overallGrade,
        rank,
        status: isPassed ? 'pass' : 'fail',
        publishedAt:
          exam.status === 'results_published' ? new Date().toISOString() : null,
        subjects,
      });
    }

    return aggregated;
  }

  async getStudentExamResult(studentId: number, examId: number) {
    const exam = await this.examRepo.findById(examId);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // Load student name
    const student = await this.studentRepo.findById(studentId);
    const studentName = student
      ? `${(student as any).user?.firstName ?? ''} ${(student as any).user?.lastName ?? ''}`.trim() ||
        `Student #${studentId}`
      : `Student #${studentId}`;

    const subjects = await this.examSubjectRepo.findByExamId(examId);
    const subjectResults: any[] = [];
    let totalMarks = 0;
    let obtainedMarks = 0;

    for (const subject of subjects) {
      const results = await this.examResultRepo.findByExamSubjectId(subject.id);
      const studentResult = results.find((r) => r.studentId === studentId);

      // Load subject name
      const subjectEntity = await this.subjectRepo.findById(subject.subjectId);
      const subjectName = subjectEntity?.name ?? `Subject #${subject.subjectId}`;

      if (studentResult) {
        const marks = studentResult.isAbsent
          ? 0
          : (studentResult.marksObtained ?? 0);
        totalMarks += subject.totalMarks;
        obtainedMarks += marks;

        subjectResults.push({
          examSubjectId: subject.id,
          subjectId: subject.subjectId,
          subjectName,
          totalMarks: subject.totalMarks,
          passingMarks: subject.passingMarks,
          marksObtained: studentResult.marksObtained,
          grade: studentResult.grade,
          isAbsent: studentResult.isAbsent,
          percentage: studentResult.percentage,
          rank: studentResult.rank,
          passed: this.gradeCalculator.isPassed(
            studentResult.marksObtained,
            subject.passingMarks,
            studentResult.isAbsent,
          ),
        });
      }
    }

    const percentage = this.gradeCalculator.calculateOverallPercentage(
      subjectResults.map((s) => ({
        marksObtained: s.marksObtained,
        totalMarks: s.totalMarks,
        isAbsent: s.isAbsent,
      })),
    );

    // Try to use a proper grading scale for the overall grade
    let overallGrade: { grade: string; gradePoint: number } = {
      grade: '-',
      gradePoint: 0,
    };
    const gradingScales = await this.gradingScaleRepo.findAll();
    if (gradingScales.length > 0 && gradingScales[0].grades) {
      overallGrade = this.gradeCalculator.calculateGrade(
        percentage,
        gradingScales[0].grades,
      );
    } else if (subjectResults.length > 0 && subjectResults[0].grade) {
      // Fallback: use the first subject's published grade
      overallGrade = { grade: subjectResults[0].grade, gradePoint: 0 };
    }

    // Get rank from first subject result
    const rank = subjectResults.length > 0 ? subjectResults[0].rank : null;

    return {
      student: { id: studentId, name: studentName },
      exam: { id: examId, name: exam.name, type: exam.type, status: exam.status },
      subjects: subjectResults,
      totalMarks,
      obtainedMarks,
      percentage,
      overallGrade: overallGrade.grade,
      rank,
    };
  }

  // ────────── Analytics ──────────

  async getExamAnalytics(examId: number) {
    const exam = await this.examRepo.findById(examId);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const subjects = await this.examSubjectRepo.findByExamId(examId);

    // Collect per-student overall results
    const studentMap = new Map<
      number,
      Array<{
        marksObtained: number | null;
        totalMarks: number;
        passingMarks: number;
        isAbsent: boolean;
        grade: string | null;
      }>
    >();

    const subjectWise: any[] = [];

    for (const subject of subjects) {
      const results = await this.examResultRepo.findByExamSubjectId(subject.id);

      let subjectPass = 0;
      let subjectFail = 0;
      let subjectTotal = 0;
      let subjectMarksSum = 0;
      let subjectHighest = -Infinity;
      let subjectLowest = Infinity;
      const subjectGradeDist: Record<string, number> = {};

      for (const result of results) {
        subjectTotal++;
        const marks = result.isAbsent ? 0 : (result.marksObtained ?? 0);
        subjectMarksSum += marks;
        if (marks > subjectHighest) subjectHighest = marks;
        if (marks < subjectLowest) subjectLowest = marks;

        if (
          this.gradeCalculator.isPassed(
            result.marksObtained,
            subject.passingMarks,
            result.isAbsent,
          )
        ) {
          subjectPass++;
        } else {
          subjectFail++;
        }

        if (result.grade) {
          subjectGradeDist[result.grade] =
            (subjectGradeDist[result.grade] || 0) + 1;
        }

        // Accumulate for overall
        if (!studentMap.has(result.studentId)) {
          studentMap.set(result.studentId, []);
        }
        studentMap.get(result.studentId)!.push({
          marksObtained: result.marksObtained,
          totalMarks: subject.totalMarks,
          passingMarks: subject.passingMarks,
          isAbsent: result.isAbsent,
          grade: result.grade,
        });
      }

      subjectWise.push({
        examSubjectId: subject.id,
        subjectId: subject.subjectId,
        totalStudents: subjectTotal,
        passCount: subjectPass,
        failCount: subjectFail,
        averageMarks:
          subjectTotal > 0
            ? Math.round((subjectMarksSum / subjectTotal) * 100) / 100
            : 0,
        highestMarks: subjectHighest === -Infinity ? 0 : subjectHighest,
        lowestMarks: subjectLowest === Infinity ? 0 : subjectLowest,
        gradeDistribution: subjectGradeDist,
      });
    }

    // Overall exam analytics
    const totalStudents = studentMap.size;
    let passCount = 0;
    let failCount = 0;
    const percentages: number[] = [];
    const overallGradeDist: Record<string, number> = {};

    for (const [, subjectResults] of studentMap) {
      const pct =
        this.gradeCalculator.calculateOverallPercentage(subjectResults);
      percentages.push(pct);

      // A student passes the exam if they pass ALL subjects
      const allPassed = subjectResults.every((sr) =>
        this.gradeCalculator.isPassed(
          sr.marksObtained,
          sr.passingMarks,
          sr.isAbsent,
        ),
      );
      if (allPassed) passCount++;
      else failCount++;

      // Grade distribution from individual results
      for (const sr of subjectResults) {
        if (sr.grade) {
          overallGradeDist[sr.grade] = (overallGradeDist[sr.grade] || 0) + 1;
        }
      }
    }

    return {
      examId,
      totalStudents,
      passCount,
      failCount,
      averagePercentage:
        percentages.length > 0
          ? Math.round(
              (percentages.reduce((a, b) => a + b, 0) / percentages.length) *
                100,
            ) / 100
          : 0,
      highestPercentage: percentages.length > 0 ? Math.max(...percentages) : 0,
      lowestPercentage: percentages.length > 0 ? Math.min(...percentages) : 0,
      gradeDistribution: overallGradeDist,
      subjectWise,
    };
  }

  async getSubjectAnalytics(examSubjectId: number) {
    const examSubject = await this.examSubjectRepo.findById(examSubjectId);
    if (!examSubject) {
      throw new NotFoundException('Exam subject not found');
    }

    const results =
      await this.examResultRepo.findByExamSubjectId(examSubjectId);

    let passCount = 0;
    let failCount = 0;
    let marksSum = 0;
    let highest = -Infinity;
    let lowest = Infinity;
    const gradeDist: Record<string, number> = {};

    for (const result of results) {
      const marks = result.isAbsent ? 0 : (result.marksObtained ?? 0);
      marksSum += marks;
      if (marks > highest) highest = marks;
      if (marks < lowest) lowest = marks;

      if (
        this.gradeCalculator.isPassed(
          result.marksObtained,
          examSubject.passingMarks,
          result.isAbsent,
        )
      ) {
        passCount++;
      } else {
        failCount++;
      }

      if (result.grade) {
        gradeDist[result.grade] = (gradeDist[result.grade] || 0) + 1;
      }
    }

    return {
      examSubjectId,
      totalStudents: results.length,
      passCount,
      failCount,
      averageMarks:
        results.length > 0
          ? Math.round((marksSum / results.length) * 100) / 100
          : 0,
      highestMarks: highest === -Infinity ? 0 : highest,
      lowestMarks: lowest === Infinity ? 0 : lowest,
      gradeDistribution: gradeDist,
    };
  }

  // ────────── Private helpers ──────────

  private validateGradeRanges(
    grades: Array<{ minPercentage: number; maxPercentage: number }>,
  ) {
    for (let i = 0; i < grades.length; i++) {
      for (let j = i + 1; j < grades.length; j++) {
        const a = grades[i];
        const b = grades[j];
        // Overlapping if a.min <= b.max AND b.min <= a.max
        if (
          a.minPercentage <= b.maxPercentage &&
          b.minPercentage <= a.maxPercentage
        ) {
          // Allow exact boundary matches (e.g., 89.99 and 90)
          if (
            a.maxPercentage === b.minPercentage ||
            b.maxPercentage === a.minPercentage
          ) {
            continue;
          }
          throw new UnprocessableEntityException({
            status: 422,
            errors: { grades: 'Grade ranges must not overlap' },
          });
        }
      }
    }
  }
}
