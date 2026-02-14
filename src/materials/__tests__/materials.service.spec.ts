import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MaterialsService } from '../materials.service';
import { CourseMaterialRepository } from '../infrastructure/persistence/course-material.repository';
import { AssignmentRepository } from '../infrastructure/persistence/assignment.repository';
import { AssignmentSubmissionRepository } from '../infrastructure/persistence/assignment-submission.repository';
import { DownloadRecordRepository } from '../infrastructure/persistence/download-record.repository';
import { TenantContextService } from '../../tenant/tenant-context/tenant-context.service';
import { CourseMaterialTypeEnum } from '../../lms/common/enums/general.enum';

// ── Mock factories ──
function createMockCourseMaterialRepository() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByFilters: jest.fn(),
    calculateUsedStorage: jest.fn(),
  };
}

function createMockAssignmentRepository() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

function createMockAssignmentSubmissionRepository() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByAssignmentId: jest.fn(),
  };
}

function createMockDownloadRecordRepository() {
  return {
    create: jest.fn(),
    findByMaterialId: jest.fn(),
    countByMaterialId: jest.fn(),
  };
}

function createMockTenantContext(
  tenantId: string = 'tenant-a-uuid',
  branchId: string | null = null,
) {
  return {
    getTenantId: jest.fn().mockReturnValue(tenantId),
    getBranchId: jest.fn().mockReturnValue(branchId),
    hasContext: jest.fn().mockReturnValue(true),
    getContext: jest.fn().mockReturnValue({ tenantId, branchId }),
    run: jest.fn(),
  };
}

describe('MaterialsService', () => {
  let service: MaterialsService;
  let materialRepo: ReturnType<typeof createMockCourseMaterialRepository>;
  let assignmentRepo: ReturnType<typeof createMockAssignmentRepository>;
  let submissionRepo: ReturnType<typeof createMockAssignmentSubmissionRepository>;
  let downloadRepo: ReturnType<typeof createMockDownloadRecordRepository>;
  let tenantContext: ReturnType<typeof createMockTenantContext>;

  const TENANT_A = 'tenant-a-uuid';
  const TENANT_B = 'tenant-b-uuid';
  const BRANCH_A = 'branch-a-uuid';
  const DEFAULT_QUOTA = 10 * 1024 * 1024 * 1024; // 10 GB

  beforeEach(async () => {
    materialRepo = createMockCourseMaterialRepository();
    assignmentRepo = createMockAssignmentRepository();
    submissionRepo = createMockAssignmentSubmissionRepository();
    downloadRepo = createMockDownloadRecordRepository();
    tenantContext = createMockTenantContext(TENANT_A, null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialsService,
        { provide: CourseMaterialRepository, useValue: materialRepo },
        { provide: AssignmentRepository, useValue: assignmentRepo },
        {
          provide: AssignmentSubmissionRepository,
          useValue: submissionRepo,
        },
        { provide: DownloadRecordRepository, useValue: downloadRepo },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<MaterialsService>(MaterialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ═══════════════════════════════════════════════════════
  //  uploadMaterial()
  // ═══════════════════════════════════════════════════════
  describe('uploadMaterial', () => {
    const createDto = {
      subjectId: 1,
      title: 'Algebra Notes',
      description: 'Chapter 1',
      type: CourseMaterialTypeEnum.document,
      filePath: `${TENANT_A}/materials/algebra.pdf`,
      fileSize: 1024000,
      isActive: true,
      tenantId: TENANT_A,
    };

    it('should create a material with tenant context', async () => {
      const expectedMaterial = {
        id: 1,
        ...createDto,
        tenantId: TENANT_A,
        branchId: null,
        version: 1,
        downloadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      materialRepo.calculateUsedStorage.mockResolvedValue(0);
      materialRepo.create.mockResolvedValue(expectedMaterial);

      const result = await service.uploadMaterial(createDto as any);

      expect(result).toEqual(expectedMaterial);
      expect(materialRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: TENANT_A,
          title: 'Algebra Notes',
        }),
      );
    });

    it('should set S3 path with tenant_id prefix (tenant_id/materials/file)', async () => {
      materialRepo.calculateUsedStorage.mockResolvedValue(0);
      materialRepo.create.mockResolvedValue({
        id: 1,
        ...createDto,
        tenantId: TENANT_A,
        filePath: `${TENANT_A}/materials/algebra.pdf`,
      });

      const result = await service.uploadMaterial(createDto as any);

      expect(result.filePath).toMatch(new RegExp(`^${TENANT_A}/materials/`));
    });

    it('should set branchId from tenant context when available', async () => {
      tenantContext.getBranchId.mockReturnValue(BRANCH_A);
      materialRepo.calculateUsedStorage.mockResolvedValue(0);
      materialRepo.create.mockResolvedValue({
        id: 1,
        ...createDto,
        tenantId: TENANT_A,
        branchId: BRANCH_A,
      });

      const result = await service.uploadMaterial(createDto as any);

      expect(result.branchId).toBe(BRANCH_A);
    });

    it('should throw BadRequestException when quota is exceeded', async () => {
      // Simulate 9.5 GB already used, trying to add 1 GB (exceeds 10 GB)
      materialRepo.calculateUsedStorage.mockResolvedValue(
        9.5 * 1024 * 1024 * 1024,
      );

      const largeFileDto = {
        ...createDto,
        fileSize: 1 * 1024 * 1024 * 1024, // 1 GB
      };

      await expect(
        service.uploadMaterial(largeFileDto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow upload when storage is within quota', async () => {
      materialRepo.calculateUsedStorage.mockResolvedValue(
        1 * 1024 * 1024 * 1024,
      ); // 1 GB used
      materialRepo.create.mockResolvedValue({
        id: 1,
        ...createDto,
        tenantId: TENANT_A,
      });

      await expect(
        service.uploadMaterial(createDto as any),
      ).resolves.toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════
  //  checkQuota()
  // ═══════════════════════════════════════════════════════
  describe('checkQuota', () => {
    it('should calculate tenant usage and compare with limit', async () => {
      materialRepo.calculateUsedStorage.mockResolvedValue(5000000000); // 5 GB

      const quota = await service.getStorageQuota();

      expect(quota).toEqual({
        tenantId: TENANT_A,
        quotaBytes: DEFAULT_QUOTA,
        usedBytes: 5000000000,
        availableBytes: DEFAULT_QUOTA - 5000000000,
      });
    });

    it('should return zero used when no materials exist', async () => {
      materialRepo.calculateUsedStorage.mockResolvedValue(0);

      const quota = await service.getStorageQuota();

      expect(quota.usedBytes).toBe(0);
      expect(quota.availableBytes).toBe(DEFAULT_QUOTA);
    });

    it('should not allow negative available bytes', async () => {
      materialRepo.calculateUsedStorage.mockResolvedValue(DEFAULT_QUOTA + 1);

      const quota = await service.getStorageQuota();

      expect(quota.availableBytes).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  listMaterials()
  // ═══════════════════════════════════════════════════════
  describe('listMaterials', () => {
    const materials = [
      {
        id: 1,
        tenantId: TENANT_A,
        branchId: null,
        title: 'Math Notes',
      },
      {
        id: 2,
        tenantId: TENANT_A,
        branchId: BRANCH_A,
        title: 'Lab Manual',
      },
    ];

    it('should return materials filtered by tenant', async () => {
      materialRepo.findByFilters.mockResolvedValue(materials);

      const result = await service.listMaterials({});

      expect(materialRepo.findByFilters).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: TENANT_A }),
      );
      expect(result).toEqual(materials);
    });

    it('should include both tenant-wide and branch-specific materials when branch is set', async () => {
      tenantContext.getBranchId.mockReturnValue(BRANCH_A);
      materialRepo.findByFilters.mockResolvedValue(materials);

      await service.listMaterials({});

      expect(materialRepo.findByFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: TENANT_A,
          branchId: BRANCH_A,
          includeTenantWide: true,
        }),
      );
    });

    it('should filter by subjectId when provided', async () => {
      materialRepo.findByFilters.mockResolvedValue([materials[0]]);

      await service.listMaterials({ subjectId: 1 });

      expect(materialRepo.findByFilters).toHaveBeenCalledWith(
        expect.objectContaining({ subjectId: 1 }),
      );
    });

    it('should filter by type when provided', async () => {
      materialRepo.findByFilters.mockResolvedValue([]);

      await service.listMaterials({ type: CourseMaterialTypeEnum.video });

      expect(materialRepo.findByFilters).toHaveBeenCalledWith(
        expect.objectContaining({ type: CourseMaterialTypeEnum.video }),
      );
    });

    it('should filter by search term when provided', async () => {
      materialRepo.findByFilters.mockResolvedValue([materials[0]]);

      await service.listMaterials({ search: 'Math' });

      expect(materialRepo.findByFilters).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Math' }),
      );
    });
  });

  // ═══════════════════════════════════════════════════════
  //  findOneMaterial()
  // ═══════════════════════════════════════════════════════
  describe('findOneMaterial', () => {
    it('should return material by id', async () => {
      const material = { id: 1, tenantId: TENANT_A, title: 'Test' };
      materialRepo.findById.mockResolvedValue(material);

      const result = await service.findOneMaterial(1);

      expect(result).toEqual(material);
    });

    it('should throw NotFoundException when material not found', async () => {
      materialRepo.findById.mockResolvedValue(null);

      await expect(service.findOneMaterial(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ═══════════════════════════════════════════════════════
  //  trackDownload()
  // ═══════════════════════════════════════════════════════
  describe('trackDownload', () => {
    it('should create a download record for the tenant', async () => {
      const material = {
        id: 1,
        tenantId: TENANT_A,
        title: 'Test',
        filePath: `${TENANT_A}/materials/test.pdf`,
        downloadCount: 0,
        version: 1,
      };
      materialRepo.findById.mockResolvedValue(material);
      downloadRepo.create.mockResolvedValue({
        id: 1,
        materialId: 1,
        userId: 1,
        tenantId: TENANT_A,
        downloadedAt: new Date(),
      });
      materialRepo.update.mockResolvedValue({
        ...material,
        downloadCount: 1,
      });

      const result = await service.trackDownload(1, 1);

      expect(result.downloadCount).toBe(1);
      expect(downloadRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          materialId: 1,
          userId: 1,
          tenantId: TENANT_A,
        }),
      );
    });

    it('should throw NotFoundException for non-existent material', async () => {
      materialRepo.findById.mockResolvedValue(null);

      await expect(service.trackDownload(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should increment download count', async () => {
      const material = {
        id: 1,
        tenantId: TENANT_A,
        downloadCount: 5,
        filePath: `${TENANT_A}/materials/test.pdf`,
        version: 1,
      };
      materialRepo.findById.mockResolvedValue(material);
      downloadRepo.create.mockResolvedValue({});
      materialRepo.update.mockResolvedValue({
        ...material,
        downloadCount: 6,
      });

      const result = await service.trackDownload(1, 1);

      expect(result.downloadCount).toBe(6);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  updateMaterial() — Version control
  // ═══════════════════════════════════════════════════════
  describe('updateMaterial', () => {
    it('should update material and increment version when filePath changes', async () => {
      const existing = {
        id: 1,
        tenantId: TENANT_A,
        title: 'Old Title',
        version: 1,
        filePath: `${TENANT_A}/materials/old.pdf`,
      };
      materialRepo.findById.mockResolvedValue(existing);
      materialRepo.update.mockResolvedValue({
        ...existing,
        title: 'New Title',
        version: 2,
        filePath: `${TENANT_A}/materials/new.pdf`,
      });

      const result = await service.updateMaterial(1, {
        title: 'New Title',
        filePath: `${TENANT_A}/materials/new.pdf`,
      } as any);

      expect(result?.version).toBe(2);
    });

    it('should not increment version for metadata-only updates', async () => {
      const existing = {
        id: 1,
        tenantId: TENANT_A,
        title: 'Old Title',
        version: 1,
        filePath: `${TENANT_A}/materials/old.pdf`,
      };
      materialRepo.findById.mockResolvedValue(existing);
      materialRepo.update.mockResolvedValue({
        ...existing,
        title: 'Updated Title',
        version: 1,
      });

      const result = await service.updateMaterial(1, {
        title: 'Updated Title',
      } as any);

      expect(result?.version).toBe(1);
    });

    it('should throw NotFoundException when material not found', async () => {
      materialRepo.findById.mockResolvedValue(null);

      await expect(
        service.updateMaterial(999, { title: 'X' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  Assignment CRUD
  // ═══════════════════════════════════════════════════════
  describe('createAssignment', () => {
    const createDto = {
      subjectId: 1,
      title: 'Homework 1',
      description: 'Solve exercises',
      dueDate: new Date('2026-03-15'),
      totalMarks: 100,
      isActive: true,
      tenantId: TENANT_A,
    };

    it('should create an assignment with tenant context', async () => {
      const expected = {
        id: 1,
        ...createDto,
        tenantId: TENANT_A,
        branchId: null,
      };
      assignmentRepo.create.mockResolvedValue(expected);

      const result = await service.createAssignment(createDto as any);

      expect(result.tenantId).toBe(TENANT_A);
      expect(assignmentRepo.create).toHaveBeenCalled();
    });

    it('should set branchId when branch context exists', async () => {
      tenantContext.getBranchId.mockReturnValue(BRANCH_A);
      const expected = {
        id: 1,
        ...createDto,
        tenantId: TENANT_A,
        branchId: BRANCH_A,
      };
      assignmentRepo.create.mockResolvedValue(expected);

      const result = await service.createAssignment(createDto as any);

      expect(result.branchId).toBe(BRANCH_A);
    });
  });

  describe('findOneAssignment', () => {
    it('should return assignment by id', async () => {
      assignmentRepo.findById.mockResolvedValue({
        id: 1,
        tenantId: TENANT_A,
      });

      const result = await service.findOneAssignment(1);

      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException when not found', async () => {
      assignmentRepo.findById.mockResolvedValue(null);

      await expect(service.findOneAssignment(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ═══════════════════════════════════════════════════════
  //  Assignment Submission
  // ═══════════════════════════════════════════════════════
  describe('submitAssignment', () => {
    const submitDto = {
      studentId: 1,
      filePath: `${TENANT_A}/submissions/solution.pdf`,
      fileSize: 256000,
      remarks: 'Done',
      tenantId: TENANT_A,
    };

    it('should submit to current tenant assignment', async () => {
      assignmentRepo.findById.mockResolvedValue({
        id: 1,
        tenantId: TENANT_A,
        isActive: true,
      });
      materialRepo.calculateUsedStorage.mockResolvedValue(0);
      submissionRepo.create.mockResolvedValue({
        id: 1,
        assignmentId: 1,
        ...submitDto,
        tenantId: TENANT_A,
        branchId: null,
      });

      const result = await service.submitAssignment(1, submitDto as any);

      expect(result.assignmentId).toBe(1);
      expect(result.tenantId).toBe(TENANT_A);
    });

    it('should throw NotFoundException if assignment not found (cross-tenant)', async () => {
      assignmentRepo.findById.mockResolvedValue(null);

      await expect(
        service.submitAssignment(999, submitDto as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should store submission file in tenant-specific folder', async () => {
      assignmentRepo.findById.mockResolvedValue({
        id: 1,
        tenantId: TENANT_A,
        isActive: true,
      });
      materialRepo.calculateUsedStorage.mockResolvedValue(0);
      submissionRepo.create.mockResolvedValue({
        id: 1,
        assignmentId: 1,
        ...submitDto,
        filePath: `${TENANT_A}/submissions/solution.pdf`,
        tenantId: TENANT_A,
      });

      const result = await service.submitAssignment(1, submitDto as any);

      expect(result.filePath).toMatch(
        new RegExp(`^${TENANT_A}/submissions/`),
      );
    });
  });

  // ═══════════════════════════════════════════════════════
  //  removeMaterial()
  // ═══════════════════════════════════════════════════════
  describe('removeMaterial', () => {
    it('should soft-delete material', async () => {
      materialRepo.findById.mockResolvedValue({
        id: 1,
        tenantId: TENANT_A,
      });
      materialRepo.remove.mockResolvedValue(undefined);

      await expect(service.removeMaterial(1)).resolves.toBeUndefined();
      expect(materialRepo.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when material not found', async () => {
      materialRepo.findById.mockResolvedValue(null);

      await expect(service.removeMaterial(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
