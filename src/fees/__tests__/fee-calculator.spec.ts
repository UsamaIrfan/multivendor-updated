import { Test, TestingModule } from '@nestjs/testing';
import { FeeCalculatorService } from '../fee-calculator.service';

describe('FeeCalculatorService', () => {
  let service: FeeCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeeCalculatorService],
    }).compile();

    service = module.get<FeeCalculatorService>(FeeCalculatorService);
  });

  describe('calculateEffectiveDiscount', () => {
    it('should return 0 when no concessions', () => {
      const result = service.calculateEffectiveDiscount([]);
      expect(result).toBe(0);
    });

    it('should return the single concession discount', () => {
      const result = service.calculateEffectiveDiscount([
        {
          id: 1,
          studentId: 1,
          type: 'scholarship',
          discountPercentage: 25,
          validFrom: new Date('2026-01-01'),
          validTo: new Date('2026-12-31'),
          approved: true,
        },
      ]);
      expect(result).toBe(25);
    });

    it('should return highest discount when multiple concessions overlap', () => {
      const result = service.calculateEffectiveDiscount([
        {
          id: 1,
          studentId: 1,
          type: 'scholarship',
          discountPercentage: 25,
          validFrom: new Date('2026-01-01'),
          validTo: new Date('2026-12-31'),
          approved: true,
        },
        {
          id: 2,
          studentId: 1,
          type: 'sibling',
          discountPercentage: 10,
          validFrom: new Date('2026-01-01'),
          validTo: new Date('2026-12-31'),
          approved: true,
        },
        {
          id: 3,
          studentId: 1,
          type: 'merit',
          discountPercentage: 50,
          validFrom: new Date('2026-01-01'),
          validTo: new Date('2026-12-31'),
          approved: true,
        },
      ]);
      expect(result).toBe(50);
    });

    it('should filter out unapproved concessions', () => {
      const result = service.calculateEffectiveDiscount([
        {
          id: 1,
          studentId: 1,
          type: 'scholarship',
          discountPercentage: 50,
          validFrom: new Date('2026-01-01'),
          validTo: new Date('2026-12-31'),
          approved: false,
        },
        {
          id: 2,
          studentId: 1,
          type: 'sibling',
          discountPercentage: 10,
          validFrom: new Date('2026-01-01'),
          validTo: new Date('2026-12-31'),
          approved: true,
        },
      ]);
      expect(result).toBe(10);
    });

    it('should filter out expired concessions', () => {
      const result = service.calculateEffectiveDiscount(
        [
          {
            id: 1,
            studentId: 1,
            type: 'scholarship',
            discountPercentage: 50,
            validFrom: new Date('2024-01-01'),
            validTo: new Date('2024-12-31'),
            approved: true,
          },
          {
            id: 2,
            studentId: 1,
            type: 'sibling',
            discountPercentage: 10,
            validFrom: new Date('2026-01-01'),
            validTo: new Date('2026-12-31'),
            approved: true,
          },
        ],
        new Date('2026-06-15'),
      );
      expect(result).toBe(10);
    });
  });

  describe('applyDiscount', () => {
    it('should return full amount when discount is 0', () => {
      const result = service.applyDiscount(10000, 0);
      expect(result).toBe(10000);
    });

    it('should apply 25% discount correctly', () => {
      const result = service.applyDiscount(10000, 25);
      expect(result).toBe(7500);
    });

    it('should apply 100% discount (full waiver)', () => {
      const result = service.applyDiscount(10000, 100);
      expect(result).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      const result = service.applyDiscount(10000, 33.33);
      expect(result).toBe(6667);
    });

    it('should handle fractional amounts', () => {
      const result = service.applyDiscount(9999.99, 15);
      expect(typeof result).toBe('number');
      // 9999.99 * 0.85 = 8499.9915 → 8499.99
      expect(result).toBe(8500);
    });
  });
});
