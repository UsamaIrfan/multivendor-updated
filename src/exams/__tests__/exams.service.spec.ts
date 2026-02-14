import { Test, TestingModule } from '@nestjs/testing';
import { ExamsService } from '../exams.service';
import { ExamRepository } from '../../lms/student/infrastructure/persistence/exam.repository';
import { ExamSubjectRepository } from '../../lms/student/infrastructure/persistence/exam-subject.repository';
import { ExamResultRepository } from '../../lms/student/infrastructure/persistence/exam-result.repository';
import { GradingScaleRepository } from '../infrastructure/persistence/grading-scale.repository';
import { StudentRepository } from '../../lms/student/infrastructure/persistence/student.repository';
import { GradeCalculatorService } from '../grade-calculator.service';
import { RankCalculatorService } from '../rank-calculator.service';
import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ExamStatusEnum } from '../../lms/common/enums/exam-status.enum';

function createMockRepository() {
  return {
    create: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

describe('ExamsService', () => {
  let service: ExamsService;
  let examRepo: ReturnType<typeof createMockRepository> & {
    findByTermId: jest.Mock;
    findByStatus: jest.Mock;
  };
  let examSubjectRepo: ReturnType<typeof createMockRepository> & {
    findByExamId: jest.Mock;
  };
  let examResultRepo: ReturnType<typeof createMockRepository> & {
    findByExamSubjectId: jest.Mock;
    findByStudentId: jest.Mock;
    findByExamSubjectIdAndStudentId: jest.Mock;
    bulkCreate: jest.Mock;
  };
  let gradingScaleRepo: ReturnType<typeof createMockRepository> & {
    findByName: jest.Mock;
  };
  let studentRepo: ReturnType<typeof createMockRepository>;
  let gradeCalculator: {
    calculatePercentage: jest.Mock;
    calculateGrade: jest.Mock;
    calculateOverallPercentage: jest.Mock;
    isPassed: jest.Mock;
  };
  let rankCalculator: {
    calculateRanks: jest.Mock;
  };

  beforeEach(async () => {
    examRepo = {
      ...createMockRepository(),
      findByTermId: jest.fn().mockResolvedValue([]),
      findByStatus: jest.fn().mockResolvedValue([]),
    };
    examSubjectRepo = {
      ...createMockRepository(),
      findByExamId: jest.fn().mockResolvedValue([]),
    };
    examResultRepo = {
      ...createMockRepository(),
      findByExamSubjectId: jest.fn().mockResolvedValue([]),
      findByStudentId: jest.fn().mockResolvedValue([]),
      findByExamSubjectIdAndStudentId: jest.fn().mockResolvedValue(null),
      bulkCreate: jest.fn().mockResolvedValue([]),
    };
    gradingScaleRepo = {
      ...createMockRepository(),
      findByName: jest.fn().mockResolvedValue(null),
    };
    studentRepo = createMockRepository();
    gradeCalculator = {
      calculatePercentage: jest.fn().mockReturnValue(85),
      calculateGrade: jest.fn().mockReturnValue({ grade: 'A', gradePoint: 9 }),
      calculateOverallPercentage: jest.fn().mockReturnValue(82.5),
      isPassed: jest.fn().mockReturnValue(true),
    };
    rankCalculator = {
      calculateRanks: jest.fn().mockReturnValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamsService,
        { provide: ExamRepository, useValue: examRepo },
        { provide: ExamSubjectRepository, useValue: examSubjectRepo },
        { provide: ExamResultRepository, useValue: examResultRepo },
        { provide: GradingScaleRepository, useValue: gradingScaleRepo },
        { provide: StudentRepository, useValue: studentRepo },
        { provide: GradeCalculatorService, useValue: gradeCalculator },
        { provide: RankCalculatorService, useValue: rankCalculator },
      ],
    }).compile();

    service = module.get<ExamsService>(ExamsService);
  });

  // ────────── Grading Scale ──────────

  describe('createGradingScale', () => {
    it('should create a grading scale', async () => {
      const dto = {
        name: 'Standard',
        grades: [
          {
            minPercentage: 90,
            maxPercentage: 100,
            grade: 'A+',
            gradePoint: 10,
          },
          { minPercentage: 0, maxPercentage: 89.99, grade: 'B', gradePoint: 8 },
        ],
      };
      gradingScaleRepo.create.mockResolvedValue({ id: 1, ...dto });

      const result = await service.createGradingScale(dto);
      expect(result.id).toBe(1);
      expect(gradingScaleRepo.create).toHaveBeenCalled();
    });

    it('should reject duplicate name', async () => {
      gradingScaleRepo.findByName.mockResolvedValue({
        id: 1,
        name: 'Existing',
      });

      await expect(
        service.createGradingScale({
          name: 'Existing',
          grades: [
            {
              minPercentage: 0,
              maxPercentage: 100,
              grade: 'P',
              gradePoint: 10,
            },
          ],
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject overlapping ranges', async () => {
      await expect(
        service.createGradingScale({
          name: 'Bad',
          grades: [
            {
              minPercentage: 50,
              maxPercentage: 100,
              grade: 'A',
              gradePoint: 10,
            },
            { minPercentage: 40, maxPercentage: 60, grade: 'B', gradePoint: 8 },
          ],
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  // ────────── Exam Schedule ──────────

  describe('createExamSchedule', () => {
    it('should create exam with subjects', async () => {
      const examData = {
        termId: 1,
        name: 'Mid-Term',
        type: 'midterm',
        startDate: '2026-03-15',
        endDate: '2026-03-25',
        subjects: [
          {
            subjectId: 1,
            examDate: '2026-03-15',
            totalMarks: 100,
            passingMarks: 35,
          },
        ],
      };
      examRepo.create.mockResolvedValue({
        id: 1,
        ...examData,
        status: ExamStatusEnum.scheduled,
      });
      examSubjectRepo.create.mockResolvedValue({
        id: 1,
        examId: 1,
        subjectId: 1,
        examDate: new Date('2026-03-15'),
        totalMarks: 100,
        passingMarks: 35,
      });

      const result = await service.createExamSchedule(examData);
      expect(result.status).toBe(ExamStatusEnum.scheduled);
      expect(examRepo.create).toHaveBeenCalled();
      expect(examSubjectRepo.create).toHaveBeenCalled();
    });

    it('should reject endDate before startDate', async () => {
      await expect(
        service.createExamSchedule({
          termId: 1,
          name: 'Bad Exam',
          type: 'midterm',
          startDate: '2026-03-25',
          endDate: '2026-03-15',
          subjects: [],
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  // ────────── Marks Entry ──────────

  describe('enterMarks', () => {
    it('should enter marks for students', async () => {
      examSubjectRepo.findById.mockResolvedValue({
        id: 1,
        examId: 1,
        totalMarks: 100,
        passingMarks: 35,
      });
      examResultRepo.create.mockImplementation(async (data) => ({
        id: Math.floor(Math.random() * 1000),
        ...data,
      }));

      const result = await service.enterMarks({
        examSubjectId: 1,
        results: [
          { studentId: 1, marksObtained: 85, isAbsent: false },
          { studentId: 2, marksObtained: 72, isAbsent: false },
        ],
      });

      expect(result.entered).toBe(2);
    });

    it('should reject marks exceeding total', async () => {
      examSubjectRepo.findById.mockResolvedValue({
        id: 1,
        examId: 1,
        totalMarks: 100,
        passingMarks: 35,
      });

      await expect(
        service.enterMarks({
          examSubjectId: 1,
          results: [{ studentId: 1, marksObtained: 150, isAbsent: false }],
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw NotFoundException for invalid examSubjectId', async () => {
      examSubjectRepo.findById.mockResolvedValue(null);

      await expect(
        service.enterMarks({
          examSubjectId: 999,
          results: [{ studentId: 1, marksObtained: 50, isAbsent: false }],
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ────────── Publish Results ──────────

  describe('publishResults', () => {
    it('should publish results and calculate grades', async () => {
      const exam = {
        id: 1,
        name: 'Mid-Term',
        status: ExamStatusEnum.completed,
      };
      const gradingScale = {
        id: 1,
        name: 'Standard',
        grades: [
          {
            minPercentage: 90,
            maxPercentage: 100,
            grade: 'A+',
            gradePoint: 10,
          },
          { minPercentage: 0, maxPercentage: 89.99, grade: 'B', gradePoint: 8 },
        ],
      };
      const subjects = [
        { id: 1, examId: 1, totalMarks: 100, passingMarks: 35 },
      ];
      const results = [
        {
          id: 1,
          examSubjectId: 1,
          studentId: 1,
          marksObtained: 85,
          isAbsent: false,
        },
      ];

      examRepo.findById.mockResolvedValue(exam);
      gradingScaleRepo.findById.mockResolvedValue(gradingScale);
      examSubjectRepo.findByExamId.mockResolvedValue(subjects);
      examResultRepo.findByExamSubjectId.mockResolvedValue(results);
      examResultRepo.update.mockResolvedValue({
        ...results[0],
        grade: 'A',
        percentage: 85,
      });
      examRepo.update.mockResolvedValue({
        ...exam,
        status: ExamStatusEnum.results_published,
      });
      rankCalculator.calculateRanks.mockReturnValue([
        { studentId: 1, percentage: 85, rank: 1 },
      ]);

      const result = await service.publishResults({
        examId: 1,
        gradingScaleId: 1,
      });

      expect(result.published).toBe(true);
      expect(result.status).toBe(ExamStatusEnum.results_published);
    });

    it('should reject publishing already-published results', async () => {
      examRepo.findById.mockResolvedValue({
        id: 1,
        status: ExamStatusEnum.results_published,
      });

      await expect(
        service.publishResults({ examId: 1, gradingScaleId: 1 }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException for invalid exam', async () => {
      examRepo.findById.mockResolvedValue(null);

      await expect(
        service.publishResults({ examId: 999, gradingScaleId: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ────────── Student Results ──────────

  describe('getStudentExamResult', () => {
    it('should return detailed result for a student-exam combination', async () => {
      const exam = {
        id: 1,
        name: 'Mid-Term',
        status: ExamStatusEnum.results_published,
      };
      const subjects = [
        { id: 1, examId: 1, subjectId: 1, totalMarks: 100, passingMarks: 35 },
      ];
      const results = [
        {
          id: 1,
          examSubjectId: 1,
          studentId: 1,
          marksObtained: 85,
          grade: 'A',
          isAbsent: false,
          percentage: 85,
          rank: 1,
        },
      ];

      examRepo.findById.mockResolvedValue(exam);
      examSubjectRepo.findByExamId.mockResolvedValue(subjects);
      examResultRepo.findByExamSubjectId.mockResolvedValue(results);
      gradeCalculator.calculateOverallPercentage.mockReturnValue(85);
      gradeCalculator.calculateGrade.mockReturnValue({
        grade: 'A',
        gradePoint: 9,
      });

      const result = await service.getStudentExamResult(1, 1);
      expect(result).toHaveProperty('subjects');
      expect(result).toHaveProperty('percentage');
      expect(result).toHaveProperty('overallGrade');
    });

    it('should throw NotFoundException for non-existent exam', async () => {
      examRepo.findById.mockResolvedValue(null);

      await expect(service.getStudentExamResult(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ────────── Analytics ──────────

  describe('getExamAnalytics', () => {
    it('should return analytics for an exam', async () => {
      const exam = {
        id: 1,
        name: 'Mid-Term',
        status: ExamStatusEnum.results_published,
      };
      const subjects = [
        { id: 1, examId: 1, totalMarks: 100, passingMarks: 35 },
      ];
      const results = [
        {
          id: 1,
          examSubjectId: 1,
          studentId: 1,
          marksObtained: 85,
          isAbsent: false,
          grade: 'A',
          percentage: 85,
        },
        {
          id: 2,
          examSubjectId: 1,
          studentId: 2,
          marksObtained: 45,
          isAbsent: false,
          grade: 'D',
          percentage: 45,
        },
      ];

      examRepo.findById.mockResolvedValue(exam);
      examSubjectRepo.findByExamId.mockResolvedValue(subjects);
      examResultRepo.findByExamSubjectId.mockResolvedValue(results);
      gradeCalculator.calculateOverallPercentage.mockImplementation(
        (subs: any[]) => {
          const sum = subs.reduce(
            (acc: number, s: any) => acc + (s.marksObtained ?? 0),
            0,
          );
          const total = subs.reduce(
            (acc: number, s: any) => acc + s.totalMarks,
            0,
          );
          return total > 0 ? Math.round((sum / total) * 10000) / 100 : 0;
        },
      );
      gradeCalculator.isPassed.mockImplementation(
        (marks: number | null, passing: number) =>
          marks !== null && marks >= passing,
      );

      const analytics = await service.getExamAnalytics(1);
      expect(analytics.examId).toBe(1);
      expect(analytics.totalStudents).toBe(2);
      expect(analytics).toHaveProperty('passCount');
      expect(analytics).toHaveProperty('failCount');
      expect(analytics).toHaveProperty('averagePercentage');
      expect(analytics).toHaveProperty('gradeDistribution');
    });
  });
});
