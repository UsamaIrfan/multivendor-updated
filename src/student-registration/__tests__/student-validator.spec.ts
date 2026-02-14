import { StudentIdGeneratorService } from '../student-id-generator.service';
import { StudentImportService } from '../student-import.service';
import {
  validateStudentAge,
  validateGuardianInfo,
} from '../validators/student-validator';

describe('Student Validation Rules', () => {
  describe('age validation (validateStudentAge)', () => {
    it('should accept age >= 5 for enrollment', () => {
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - 6);
      expect(() =>
        validateStudentAge(dob.toISOString().split('T')[0]),
      ).not.toThrow();
    });

    it('should accept exactly age 5', () => {
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - 5);
      expect(() =>
        validateStudentAge(dob.toISOString().split('T')[0]),
      ).not.toThrow();
    });

    it('should reject age < 5', () => {
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - 4);
      dob.setMonth(dob.getMonth() + 1); // just under 5
      expect(() =>
        validateStudentAge(dob.toISOString().split('T')[0]),
      ).toThrow();
    });

    it('should handle edge case at exactly 5 years old today', () => {
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - 5);
      expect(() =>
        validateStudentAge(dob.toISOString().split('T')[0]),
      ).not.toThrow();
    });
  });

  describe('guardian validation (validateGuardianInfo)', () => {
    it('should accept valid guardian info', () => {
      expect(() =>
        validateGuardianInfo({ guardianName: 'Jane', guardianPhone: '+1555' }),
      ).not.toThrow();
    });

    it('should require at least guardianName', () => {
      expect(() =>
        validateGuardianInfo({ guardianPhone: '+1555' } as any),
      ).toThrow();
    });

    it('should require at least guardianPhone', () => {
      expect(() =>
        validateGuardianInfo({ guardianName: 'Jane' } as any),
      ).toThrow();
    });

    it('should reject empty strings', () => {
      expect(() =>
        validateGuardianInfo({ guardianName: '', guardianPhone: '' }),
      ).toThrow();
    });
  });
});

describe('StudentIdGeneratorService', () => {
  let generator: StudentIdGeneratorService;
  let mockStudentRepo: { findAll: jest.Mock };

  beforeEach(() => {
    mockStudentRepo = { findAll: jest.fn() };
    generator = new StudentIdGeneratorService(mockStudentRepo as any);
  });

  describe('generate', () => {
    it('should generate format: STU-YYYY-XXXX', async () => {
      mockStudentRepo.findAll.mockResolvedValue([]);

      const result = await generator.generate();
      const year = new Date().getFullYear();

      expect(result).toMatch(new RegExp(`^STU-${year}-\\d{4,}$`));
    });

    it('should increment sequence based on existing students', async () => {
      mockStudentRepo.findAll.mockResolvedValue([
        { id: 1, rollNumber: 'STU-2026-0001' },
        { id: 2, rollNumber: 'STU-2026-0002' },
        { id: 3, rollNumber: 'STU-2026-0003' },
      ]);

      const result = await generator.generate();

      expect(result).toContain('0004');
    });

    it('should start at 0001 when no students exist', async () => {
      mockStudentRepo.findAll.mockResolvedValue([]);

      const result = await generator.generate();

      expect(result).toContain('0001');
    });
  });
});

describe('StudentImportService', () => {
  let importService: StudentImportService;

  beforeEach(() => {
    importService = new StudentImportService();
  });

  describe('parseAndValidateCsv', () => {
    it('should parse valid CSV correctly', () => {
      const csv = [
        'firstName,lastName,email,password,dateOfBirth,gender,guardianName,guardianPhone',
        'John,Doe,john@test.com,Secret123!,2012-01-15,male,Parent,+1555000001',
      ].join('\n');

      const result = importService.parseAndValidateCsv(
        Buffer.from(csv),
        'test.csv',
      );

      expect(result.validRows).toHaveLength(1);
      expect(result.validRows[0].firstName).toBe('John');
      expect(result.errors).toHaveLength(0);
    });

    it('should report errors for rows with missing required fields', () => {
      const csv = [
        'firstName,lastName,email,password,dateOfBirth,gender,guardianName,guardianPhone',
        ',Doe,john@test.com,Secret123!,2012-01-15,male,Parent,+1555000001', // missing firstName
      ].join('\n');

      const result = importService.parseAndValidateCsv(
        Buffer.from(csv),
        'test.csv',
      );

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].row).toBe(2);
    });

    it('should reject non-CSV files', () => {
      expect(() =>
        importService.parseAndValidateCsv(Buffer.from('some data'), 'test.txt'),
      ).toThrow();
    });

    it('should handle multiple valid and invalid rows', () => {
      const csv = [
        'firstName,lastName,email,password,dateOfBirth,gender,guardianName,guardianPhone',
        'Alice,Smith,alice@test.com,Pass123!,2011-03-10,female,Mom,+1555000002',
        ',Missing,bad@test.com,Pass123!,2012-05-20,male,Dad,+1555000003',
        'Bob,Jones,bob@test.com,Pass123!,Pass123!,2010-08-25,male,Dad,+1555000004',
      ].join('\n');

      const result = importService.parseAndValidateCsv(
        Buffer.from(csv),
        'students.csv',
      );

      expect(result.validRows).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
    });
  });
});
