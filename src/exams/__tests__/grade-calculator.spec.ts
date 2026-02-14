import {
  GradeCalculatorService,
  GradeDefinition,
} from '../grade-calculator.service';

describe('GradeCalculatorService', () => {
  let service: GradeCalculatorService;

  const standardGrades: GradeDefinition[] = [
    {
      minPercentage: 90,
      maxPercentage: 100,
      grade: 'A+',
      gradePoint: 10,
      description: 'Outstanding',
    },
    {
      minPercentage: 80,
      maxPercentage: 89.99,
      grade: 'A',
      gradePoint: 9,
      description: 'Excellent',
    },
    {
      minPercentage: 70,
      maxPercentage: 79.99,
      grade: 'B+',
      gradePoint: 8,
      description: 'Very Good',
    },
    {
      minPercentage: 60,
      maxPercentage: 69.99,
      grade: 'B',
      gradePoint: 7,
      description: 'Good',
    },
    {
      minPercentage: 50,
      maxPercentage: 59.99,
      grade: 'C',
      gradePoint: 6,
      description: 'Average',
    },
    {
      minPercentage: 40,
      maxPercentage: 49.99,
      grade: 'D',
      gradePoint: 5,
      description: 'Below Average',
    },
    {
      minPercentage: 0,
      maxPercentage: 39.99,
      grade: 'F',
      gradePoint: 0,
      description: 'Fail',
    },
  ];

  beforeEach(() => {
    service = new GradeCalculatorService();
  });

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(service.calculatePercentage(85, 100)).toBe(85);
    });

    it('should handle partial marks', () => {
      expect(service.calculatePercentage(21, 50)).toBe(42);
    });

    it('should return 0 when totalMarks is 0', () => {
      expect(service.calculatePercentage(0, 0)).toBe(0);
    });

    it('should round to 2 decimals', () => {
      expect(service.calculatePercentage(33, 100)).toBe(33);
      expect(service.calculatePercentage(1, 3)).toBeCloseTo(33.33, 1);
    });
  });

  describe('calculateGrade', () => {
    it('should return A+ for 95%', () => {
      const result = service.calculateGrade(95, standardGrades);
      expect(result.grade).toBe('A+');
      expect(result.gradePoint).toBe(10);
    });

    it('should return A for 85%', () => {
      const result = service.calculateGrade(85, standardGrades);
      expect(result.grade).toBe('A');
      expect(result.gradePoint).toBe(9);
    });

    it('should return F for 30%', () => {
      const result = service.calculateGrade(30, standardGrades);
      expect(result.grade).toBe('F');
      expect(result.gradePoint).toBe(0);
    });

    it('should return D for boundary value 40%', () => {
      const result = service.calculateGrade(40, standardGrades);
      expect(result.grade).toBe('D');
      expect(result.gradePoint).toBe(5);
    });

    it('should return A+ for 100%', () => {
      const result = service.calculateGrade(100, standardGrades);
      expect(result.grade).toBe('A+');
    });

    it('should return F for 0%', () => {
      const result = service.calculateGrade(0, standardGrades);
      expect(result.grade).toBe('F');
    });
  });

  describe('calculateOverallPercentage', () => {
    it('should calculate weighted average across subjects', () => {
      const subjectResults = [
        { marksObtained: 85, totalMarks: 100, isAbsent: false },
        { marksObtained: 70, totalMarks: 100, isAbsent: false },
        { marksObtained: 90, totalMarks: 100, isAbsent: false },
      ];
      const result = service.calculateOverallPercentage(subjectResults);
      expect(result).toBeCloseTo(81.67, 1);
    });

    it('should treat absent students as 0 marks', () => {
      const subjectResults = [
        { marksObtained: 80, totalMarks: 100, isAbsent: false },
        { marksObtained: null, totalMarks: 100, isAbsent: true },
      ];
      const result = service.calculateOverallPercentage(subjectResults);
      expect(result).toBe(40);
    });

    it('should return 0 for empty subjects', () => {
      expect(service.calculateOverallPercentage([])).toBe(0);
    });
  });

  describe('isPassed', () => {
    it('should return true when marks >= passingMarks', () => {
      expect(service.isPassed(40, 35)).toBe(true);
    });

    it('should return true when marks equal passingMarks', () => {
      expect(service.isPassed(35, 35)).toBe(true);
    });

    it('should return false when marks < passingMarks', () => {
      expect(service.isPassed(30, 35)).toBe(false);
    });

    it('should return false when absent', () => {
      expect(service.isPassed(null, 35, true)).toBe(false);
    });
  });
});
