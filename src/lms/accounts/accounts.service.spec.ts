import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { IncomeRepository } from './infrastructure/persistence/income.repository';
import { ExpenseRepository } from './infrastructure/persistence/expense.repository';

function createMockRepository() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

describe('AccountsService', () => {
  let service: AccountsService;
  let incomeRepo: ReturnType<typeof createMockRepository>;
  let expenseRepo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    incomeRepo = createMockRepository();
    expenseRepo = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: IncomeRepository, useValue: incomeRepo },
        { provide: ExpenseRepository, useValue: expenseRepo },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── Income ───────────────────────────────────────────
  describe('Income', () => {
    const mockIncome = { id: 1, amount: 10000, category: 'tuition' };

    describe('createIncome', () => {
      it('should create an income record', async () => {
        incomeRepo.create.mockResolvedValue(mockIncome);
        const result = await service.createIncome({ amount: 10000 } as any);
        expect(result).toEqual(mockIncome);
        expect(incomeRepo.create).toHaveBeenCalled();
      });
    });

    describe('findAllIncomes', () => {
      it('should return all income records', async () => {
        incomeRepo.findAll.mockResolvedValue([mockIncome]);
        expect(await service.findAllIncomes()).toEqual([mockIncome]);
      });
    });

    describe('findOneIncome', () => {
      it('should return an income record by id', async () => {
        incomeRepo.findById.mockResolvedValue(mockIncome);
        expect(await service.findOneIncome(1)).toEqual(mockIncome);
      });

      it('should throw NotFoundException if not found', async () => {
        incomeRepo.findById.mockResolvedValue(null);
        await expect(service.findOneIncome(999)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('updateIncome', () => {
      it('should update an income record', async () => {
        incomeRepo.findById.mockResolvedValue(mockIncome);
        incomeRepo.update.mockResolvedValue({ ...mockIncome, amount: 15000 });
        const result = await service.updateIncome(1, { amount: 15000 } as any);
        expect(result?.amount).toBe(15000);
      });

      it('should throw NotFoundException if not found', async () => {
        incomeRepo.findById.mockResolvedValue(null);
        await expect(service.updateIncome(999, {} as any)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('removeIncome', () => {
      it('should remove an income record', async () => {
        incomeRepo.findById.mockResolvedValue(mockIncome);
        incomeRepo.remove.mockResolvedValue(undefined);
        await expect(service.removeIncome(1)).resolves.toBeUndefined();
      });

      it('should throw NotFoundException if not found', async () => {
        incomeRepo.findById.mockResolvedValue(null);
        await expect(service.removeIncome(999)).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  // ─── Expense ──────────────────────────────────────────
  describe('Expense', () => {
    const mockExpense = { id: 1, amount: 5000, category: 'salary' };

    describe('createExpense', () => {
      it('should create an expense record', async () => {
        expenseRepo.create.mockResolvedValue(mockExpense);
        const result = await service.createExpense({ amount: 5000 } as any);
        expect(result).toEqual(mockExpense);
        expect(expenseRepo.create).toHaveBeenCalled();
      });
    });

    describe('findAllExpenses', () => {
      it('should return all expense records', async () => {
        expenseRepo.findAll.mockResolvedValue([mockExpense]);
        expect(await service.findAllExpenses()).toEqual([mockExpense]);
      });
    });

    describe('findOneExpense', () => {
      it('should return an expense record by id', async () => {
        expenseRepo.findById.mockResolvedValue(mockExpense);
        expect(await service.findOneExpense(1)).toEqual(mockExpense);
      });

      it('should throw NotFoundException if not found', async () => {
        expenseRepo.findById.mockResolvedValue(null);
        await expect(service.findOneExpense(999)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('updateExpense', () => {
      it('should update an expense record', async () => {
        expenseRepo.findById.mockResolvedValue(mockExpense);
        expenseRepo.update.mockResolvedValue({ ...mockExpense, amount: 7000 });
        const result = await service.updateExpense(1, { amount: 7000 } as any);
        expect(result?.amount).toBe(7000);
      });

      it('should throw NotFoundException if not found', async () => {
        expenseRepo.findById.mockResolvedValue(null);
        await expect(service.updateExpense(999, {} as any)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('removeExpense', () => {
      it('should remove an expense record', async () => {
        expenseRepo.findById.mockResolvedValue(mockExpense);
        expenseRepo.remove.mockResolvedValue(undefined);
        await expect(service.removeExpense(1)).resolves.toBeUndefined();
      });

      it('should throw NotFoundException if not found', async () => {
        expenseRepo.findById.mockResolvedValue(null);
        await expect(service.removeExpense(999)).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });
});
