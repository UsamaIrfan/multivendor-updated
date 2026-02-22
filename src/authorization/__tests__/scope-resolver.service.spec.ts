import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ScopeResolverService } from '../services/scope-resolver.service';

describe('ScopeResolverService', () => {
  let service: ScopeResolverService;
  let dataSource: { query: jest.Mock };

  beforeEach(async () => {
    dataSource = { query: jest.fn().mockResolvedValue([]) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScopeResolverService,
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<ScopeResolverService>(ScopeResolverService);
  });

  it('should return empty scope context when tenantId is null', async () => {
    const result = await service.resolve(1, 1, null, null);

    expect(result).toEqual({
      allowedSectionIds: [],
      allowedStudentIds: [],
      staffId: null,
      studentId: null,
    });
    expect(dataSource.query).not.toHaveBeenCalled();
  });

  it('should resolve teacher sections from timetable_slot + staff', async () => {
    // 4 parallel queries: sections, parentStudents, staffId, studentId
    dataSource.query
      .mockResolvedValueOnce([{ sectionId: 10 }, { sectionId: 20 }]) // teacher sections
      .mockResolvedValueOnce([]) // parent students
      .mockResolvedValueOnce([{ id: 5 }]) // staffId from staff_mgmt
      .mockResolvedValueOnce([]); // studentId

    const result = await service.resolve(100, 4, 'tenant-uuid', null);

    expect(result.allowedSectionIds).toEqual([10, 20]);
    expect(result.staffId).toBe(5);
    expect(result.studentId).toBeNull();
    expect(result.allowedStudentIds).toEqual([]);
  });

  it('should resolve parent students from student_guardian', async () => {
    dataSource.query
      .mockResolvedValueOnce([]) // teacher sections
      .mockResolvedValueOnce([{ studentId: 30 }, { studentId: 40 }]) // parent students
      .mockResolvedValueOnce([]) // staffId — no staff_mgmt match
      .mockResolvedValueOnce([]); // studentId — no student match (parent isn't a student)

    const result = await service.resolve(200, 7, 'tenant-uuid', null);

    expect(result.allowedStudentIds).toEqual([30, 40]);
    expect(result.staffId).toBeNull();
    expect(result.studentId).toBeNull();
  });

  it('should resolve studentId for student role', async () => {
    dataSource.query
      .mockResolvedValueOnce([]) // teacher sections
      .mockResolvedValueOnce([]) // parent students
      .mockResolvedValueOnce([]) // staffId — no staff_mgmt
      .mockResolvedValueOnce([{ id: 50 }]); // studentId

    const result = await service.resolve(300, 3, 'tenant-uuid', null);

    expect(result.studentId).toBe(50);
    expect(result.staffId).toBeNull();
  });

  it('should fall back to LMS staff table when staff_mgmt has no match', async () => {
    dataSource.query
      .mockResolvedValueOnce([]) // teacher sections
      .mockResolvedValueOnce([]) // parent students
      .mockResolvedValueOnce([]) // staffId — no staff_mgmt match
      .mockResolvedValueOnce([]); // studentId

    // After the 4 initial queries, a fallback query for LMS staff is made
    // But since all 4 queries are in parallel and the staffId query internally
    // does 2 queries (staff_mgmt then staff), we need to handle this.
    // Actually, the service does staff_mgmt first, then staff as fallback
    // within a single call, so both are separate dataSource.query calls.

    // Let's re-mock properly for the sequential staff queries
    dataSource.query.mockReset();
    dataSource.query.mockImplementation((sql: string) => {
      if (sql.includes('timetable_slot')) return Promise.resolve([]);
      if (sql.includes('student_guardian')) return Promise.resolve([]);
      if (sql.includes('staff_mgmt')) return Promise.resolve([]); // no match
      if (sql.includes('FROM staff')) return Promise.resolve([{ id: 77 }]); // fallback match
      if (sql.includes('FROM student')) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const result = await service.resolve(400, 5, 'tenant-uuid', null);

    expect(result.staffId).toBe(77);
  });

  it('should cache scope context and avoid duplicate queries', async () => {
    dataSource.query.mockResolvedValue([]);

    await service.resolve(1, 1, 'tenant-uuid', null);
    const callCount = dataSource.query.mock.calls.length;

    await service.resolve(1, 1, 'tenant-uuid', null);
    // Second call should not add any more query calls
    expect(dataSource.query.mock.calls.length).toBe(callCount);
  });

  it('should return a copy from cache (prevent mutation)', async () => {
    dataSource.query.mockResolvedValue([]);

    const result1 = await service.resolve(1, 1, 'tenant-uuid', null);
    result1.allowedSectionIds.push(999);

    const result2 = await service.resolve(1, 1, 'tenant-uuid', null);
    expect(result2.allowedSectionIds).not.toContain(999);
  });

  it('should invalidate cache for a specific user', async () => {
    dataSource.query.mockResolvedValue([]);

    await service.resolve(1, 1, 'tenant-uuid', null);
    const before = dataSource.query.mock.calls.length;

    service.invalidateCache(1);

    await service.resolve(1, 1, 'tenant-uuid', null);
    expect(dataSource.query.mock.calls.length).toBeGreaterThan(before);
  });

  it('should handle query errors gracefully and return empty values', async () => {
    dataSource.query.mockRejectedValue(new Error('DB connection failed'));

    const result = await service.resolve(1, 1, 'tenant-uuid', null);

    expect(result.allowedSectionIds).toEqual([]);
    expect(result.allowedStudentIds).toEqual([]);
    expect(result.staffId).toBeNull();
    expect(result.studentId).toBeNull();
  });

  it('should include branchId filter for teacher sections when provided', async () => {
    dataSource.query.mockResolvedValue([]);

    await service.resolve(1, 4, 'tenant-uuid', 'branch-uuid');

    // Find the timetable_slot query call
    const sectionCall = dataSource.query.mock.calls.find((call: any[]) =>
      String(call[0]).includes('timetable_slot'),
    );

    expect(sectionCall).toBeDefined();
    // The query should include the branchId parameter
    if (sectionCall) {
      expect(sectionCall[0]).toContain('branchId');
      expect(sectionCall[1]).toContain('branch-uuid');
    }
  });
});
