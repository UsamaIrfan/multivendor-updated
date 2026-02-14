import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { StudentOwnershipGuard } from '../guards/student-ownership.guard';
import { StudentRepository } from '../../lms/student/infrastructure/persistence/student.repository';

describe('StudentOwnershipGuard', () => {
  let guard: StudentOwnershipGuard;
  let studentRepo: { findById: jest.Mock };

  function createMockContext(
    userId: number,
    roleId: number,
    params: Record<string, string> = {},
  ): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId, role: { id: roleId } },
          params,
        }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    studentRepo = { findById: jest.fn() };
    guard = new StudentOwnershipGuard(
      studentRepo as unknown as StudentRepository,
    );
  });

  it('should allow admin to access any student', async () => {
    const ctx = createMockContext(1, 1, { id: '5' }); // roleId=1 (admin)
    studentRepo.findById.mockResolvedValue({ id: 5, userId: 99 });

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
  });

  it('should allow staff to access any student', async () => {
    const ctx = createMockContext(1, 5, { id: '5' }); // roleId=5 (staff)
    studentRepo.findById.mockResolvedValue({ id: 5, userId: 99 });

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
  });

  it('should allow teacher to access any student', async () => {
    const ctx = createMockContext(1, 4, { id: '5' }); // roleId=4 (teacher)
    studentRepo.findById.mockResolvedValue({ id: 5, userId: 99 });

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
  });

  it('should allow student to access own record', async () => {
    const ctx = createMockContext(10, 3, { id: '5' }); // roleId=3 (student)
    studentRepo.findById.mockResolvedValue({ id: 5, userId: 10 }); // student's userId matches

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
  });

  it('should deny student access to another students record', async () => {
    const ctx = createMockContext(10, 3, { id: '5' }); // student userId=10
    studentRepo.findById.mockResolvedValue({ id: 5, userId: 99 }); // different userId

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('should deny when student record not found', async () => {
    const ctx = createMockContext(10, 3, { id: '999' });
    studentRepo.findById.mockResolvedValue(null);

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('should allow access when no :id param exists (e.g. list endpoint)', async () => {
    const ctx = createMockContext(10, 3, {}); // no id param

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
  });
});
