import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NoticesService } from './notices.service';
import { NoticesRepository } from './infrastructure/persistence/notices.repository';
import { TenantContextService } from '../tenant/tenant-context/tenant-context.service';
import { Notice } from './domain/notice';

function createMockRepository() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByBranch: jest.fn(),
    findMyNotices: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

function createMockTenantContext() {
  return {
    getTenantId: jest.fn().mockReturnValue('tenant-uuid-1'),
    getBranchId: jest.fn().mockReturnValue('branch-uuid-1'),
    hasContext: jest.fn().mockReturnValue(true),
    getContext: jest.fn().mockReturnValue({
      tenantId: 'tenant-uuid-1',
      branchId: 'branch-uuid-1',
    }),
  };
}

describe('NoticesService', () => {
  let service: NoticesService;
  let repo: ReturnType<typeof createMockRepository>;
  let tenantContext: ReturnType<typeof createMockTenantContext>;

  const mockNotice: Partial<Notice> = {
    id: 'notice-uuid-1',
    tenantId: 'tenant-uuid-1',
    branchId: 'branch-uuid-1',
    targetBranches: [],
    targetRoles: ['student', 'staff'],
    title: 'Test Notice',
    content: 'Test content',
    attachments: null,
    isPublished: true,
    publishDate: null,
    expiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    repo = createMockRepository();
    tenantContext = createMockTenantContext();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticesService,
        { provide: NoticesRepository, useValue: repo },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<NoticesService>(NoticesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── Create ─────────────────────────────────────────────
  describe('create', () => {
    it('should create a notice with tenant context', async () => {
      repo.create.mockResolvedValue(mockNotice);

      const result = await service.create({
        tenantId: 'tenant-uuid-1',
        title: 'Test Notice',
        content: 'Test content',
        targetBranches: [],
        targetRoles: ['student', 'staff'],
      });

      expect(result).toEqual(mockNotice);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-uuid-1',
          branchId: 'branch-uuid-1',
          title: 'Test Notice',
          targetBranches: [],
          targetRoles: ['student', 'staff'],
        }),
      );
    });

    it('should set default values for optional fields', async () => {
      repo.create.mockResolvedValue(mockNotice);

      await service.create({
        tenantId: 'tenant-uuid-1',
        title: 'Minimal Notice',
        content: 'Minimal content',
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          targetBranches: [],
          targetRoles: [],
          attachments: null,
          isPublished: false,
          publishDate: null,
          expiresAt: null,
        }),
      );
    });

    it('should handle attachments in tenant folder', async () => {
      const noticeWithAttachments = {
        ...mockNotice,
        attachments: ['tenant-uuid-1/notices/doc.pdf'],
      };
      repo.create.mockResolvedValue(noticeWithAttachments);

      const result = await service.create({
        tenantId: 'tenant-uuid-1',
        title: 'Notice with attachment',
        content: 'See attached',
        attachments: ['tenant-uuid-1/notices/doc.pdf'],
      });

      expect(result.attachments).toContain('tenant-uuid-1/notices/doc.pdf');
    });
  });

  // ─── Find All ───────────────────────────────────────────
  describe('findAll', () => {
    it('should return all notices for the tenant', async () => {
      repo.findAll.mockResolvedValue([mockNotice]);
      const result = await service.findAll();
      expect(result).toEqual([mockNotice]);
    });
  });

  // ─── Find One ───────────────────────────────────────────
  describe('findOne', () => {
    it('should return a notice by id', async () => {
      repo.findById.mockResolvedValue(mockNotice);
      const result = await service.findOne('notice-uuid-1');
      expect(result).toEqual(mockNotice);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── Find by Branch ────────────────────────────────────
  describe('findByBranch', () => {
    it('should return tenant-wide + branch-specific notices', async () => {
      const tenantWide = { ...mockNotice, targetBranches: [] };
      const branchSpecific = {
        ...mockNotice,
        id: 'notice-uuid-2',
        targetBranches: ['branch-uuid-1'],
      };
      repo.findByBranch.mockResolvedValue([tenantWide, branchSpecific]);

      const result = await service.findByBranch('branch-uuid-1');
      expect(result).toHaveLength(2);
    });
  });

  // ─── My Notices ─────────────────────────────────────────
  describe('findMyNotices', () => {
    it('should call repository with correct branch and role params', async () => {
      repo.findMyNotices.mockResolvedValue([mockNotice]);

      const result = await service.findMyNotices(
        ['branch-uuid-1', 'branch-uuid-2'],
        'staff',
      );

      expect(repo.findMyNotices).toHaveBeenCalledWith({
        userBranches: ['branch-uuid-1', 'branch-uuid-2'],
        userRoles: ['staff'],
      });
      expect(result).toEqual([mockNotice]);
    });

    it('should return empty array when no matching notices', async () => {
      repo.findMyNotices.mockResolvedValue([]);

      const result = await service.findMyNotices([], 'student');
      expect(result).toEqual([]);
    });
  });

  // ─── Update ─────────────────────────────────────────────
  describe('update', () => {
    it('should update a notice', async () => {
      repo.findById.mockResolvedValue(mockNotice);
      const updatedNotice = { ...mockNotice, title: 'Updated Title' };
      repo.update.mockResolvedValue(updatedNotice);

      const result = await service.update('notice-uuid-1', {
        title: 'Updated Title',
      });
      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException if notice does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(
        service.update('non-existent', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if update returns null', async () => {
      repo.findById.mockResolvedValue(mockNotice);
      repo.update.mockResolvedValue(null);
      await expect(
        service.update('notice-uuid-1', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── Remove ─────────────────────────────────────────────
  describe('remove', () => {
    it('should remove a notice', async () => {
      repo.findById.mockResolvedValue(mockNotice);
      repo.remove.mockResolvedValue(undefined);

      await expect(service.remove('notice-uuid-1')).resolves.toBeUndefined();
      expect(repo.remove).toHaveBeenCalledWith('notice-uuid-1');
    });

    it('should throw NotFoundException if notice does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
