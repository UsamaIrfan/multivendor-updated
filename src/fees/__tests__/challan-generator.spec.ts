import { Test, TestingModule } from '@nestjs/testing';
import { ChallanGeneratorService } from '../challan-generator.service';
import { FeeChallanRepository } from '../../lms/student/infrastructure/persistence/fee-challan.repository';

describe('ChallanGeneratorService', () => {
  let service: ChallanGeneratorService;
  let challanRepo: {
    findByChallanNumber: jest.Mock;
    findByStudentId: jest.Mock;
    findByStudentAndStructureAndInstallment: jest.Mock;
    findPendingByClassId: jest.Mock;
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    getLastChallanNumberForYear: jest.Mock;
  };

  beforeEach(async () => {
    challanRepo = {
      create: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByChallanNumber: jest.fn().mockResolvedValue(null),
      findByStudentId: jest.fn().mockResolvedValue([]),
      findByStudentAndStructureAndInstallment: jest
        .fn()
        .mockResolvedValue(null),
      findPendingByClassId: jest.fn().mockResolvedValue([]),
      getLastChallanNumberForYear: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChallanGeneratorService,
        { provide: FeeChallanRepository, useValue: challanRepo },
      ],
    }).compile();

    service = module.get<ChallanGeneratorService>(ChallanGeneratorService);
  });

  describe('generate', () => {
    it('should generate challan number in CH-YYYY-XXXXXX format', async () => {
      const result = await service.generate();
      expect(result).toMatch(/^CH-\d{4}-\d{6}$/);
    });

    it('should use current year', async () => {
      const currentYear = new Date().getFullYear();
      const result = await service.generate();
      expect(result).toContain(`CH-${currentYear}-`);
    });

    it('should start from 000001 when no previous challans', async () => {
      challanRepo.getLastChallanNumberForYear.mockResolvedValue(null);
      const result = await service.generate();
      const currentYear = new Date().getFullYear();
      expect(result).toBe(`CH-${currentYear}-000001`);
    });

    it('should increment from last challan number', async () => {
      const currentYear = new Date().getFullYear();
      challanRepo.getLastChallanNumberForYear.mockResolvedValue(
        `CH-${currentYear}-000042`,
      );

      const result = await service.generate();
      expect(result).toBe(`CH-${currentYear}-000043`);
    });

    it('should handle yearly reset', async () => {
      // Last challan was from previous year
      challanRepo.getLastChallanNumberForYear.mockResolvedValue(null);

      const result = await service.generate();
      const currentYear = new Date().getFullYear();
      expect(result).toBe(`CH-${currentYear}-000001`);
    });

    it('should generate sequential numbers for concurrent calls', async () => {
      let counter = 0;
      challanRepo.getLastChallanNumberForYear.mockImplementation(() => {
        counter++;
        const currentYear = new Date().getFullYear();
        if (counter === 1) return Promise.resolve(null);
        return Promise.resolve(
          `CH-${currentYear}-${String(counter - 1).padStart(6, '0')}`,
        );
      });

      const results: string[] = [];
      for (let i = 0; i < 3; i++) {
        results.push(await service.generate());
      }

      const numbers = results.map((r) => parseInt(r.split('-')[2], 10));
      // Each call should produce a unique number
      const unique = new Set(numbers);
      expect(unique.size).toBe(3);
    });
  });
});
