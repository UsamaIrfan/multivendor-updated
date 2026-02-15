import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseMaterialRepository } from './infrastructure/persistence/course-material.repository';
import { AssignmentRepository } from './infrastructure/persistence/assignment.repository';
import { AssignmentSubmissionRepository } from './infrastructure/persistence/assignment-submission.repository';
import { DownloadRecordRepository } from './infrastructure/persistence/download-record.repository';
import { TenantContextService } from '../tenant/tenant-context/tenant-context.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { CourseMaterial } from './domain/course-material';
import { Assignment } from './domain/assignment';
import { AssignmentSubmission } from './domain/assignment-submission';
import { StorageQuotaDto } from './dto/storage-quota.dto';
import { NullableType } from '../utils/types/nullable.type';

/** Default storage quota per tenant: 10 GB */
const DEFAULT_STORAGE_QUOTA = 10 * 1024 * 1024 * 1024;

@Injectable()
export class MaterialsService {
  constructor(
    private readonly materialRepository: CourseMaterialRepository,
    private readonly assignmentRepository: AssignmentRepository,
    private readonly submissionRepository: AssignmentSubmissionRepository,
    private readonly downloadRecordRepository: DownloadRecordRepository,
    private readonly tenantContext: TenantContextService,
  ) {}

  // ─── Course Material CRUD ─────────────────────────────

  async uploadMaterial(dto: CreateMaterialDto): Promise<CourseMaterial> {
    const tenantId = this.tenantContext.getTenantId();
    const branchId = this.tenantContext.getBranchId() ?? dto.branchId ?? null;

    // Check storage quota before upload
    await this.checkQuota(tenantId, dto.fileSize ?? 0);

    return this.materialRepository.create({
      ...dto,
      tenantId,
      branchId,
      version: 1,
      downloadCount: 0,
      fileSize: dto.fileSize ?? 0,
    });
  }

  async listMaterials(query: QueryMaterialDto): Promise<CourseMaterial[]> {
    const tenantId = this.tenantContext.getTenantId();
    const branchId = this.tenantContext.getBranchId();

    return this.materialRepository.findByFilters({
      tenantId,
      branchId: branchId ?? undefined,
      includeTenantWide: !!branchId,
      subjectId: query.subjectId,
      type: query.type,
      search: query.search,
    });
  }

  async findOneMaterial(id: number): Promise<CourseMaterial> {
    const material = await this.materialRepository.findById(id);
    if (!material) {
      throw new NotFoundException('Course material not found');
    }
    return material;
  }

  async updateMaterial(
    id: number,
    dto: UpdateMaterialDto,
  ): Promise<NullableType<CourseMaterial>> {
    const existing = await this.findOneMaterial(id);

    // Version control: increment version when file content changes
    const payload: any = { ...dto };
    if (dto.filePath && dto.filePath !== existing.filePath) {
      payload.version = (existing.version ?? 1) + 1;
    }

    return this.materialRepository.update(id, payload);
  }

  async removeMaterial(id: number): Promise<void> {
    await this.findOneMaterial(id);
    return this.materialRepository.remove(id);
  }

  // ─── Download Tracking ────────────────────────────────

  async trackDownload(
    materialId: number,
    userId: number,
  ): Promise<CourseMaterial> {
    const material = await this.findOneMaterial(materialId);
    const tenantId = this.tenantContext.getTenantId();

    // Create download record
    await this.downloadRecordRepository.create({
      materialId,
      userId,
      tenantId,
      downloadedAt: new Date(),
    });

    // Increment download count
    const updated = await this.materialRepository.update(materialId, {
      downloadCount: (material.downloadCount ?? 0) + 1,
    });

    return updated!;
  }

  // ─── Storage Quota ────────────────────────────────────

  async getStorageQuota(): Promise<StorageQuotaDto> {
    const tenantId = this.tenantContext.getTenantId();
    const usedBytes =
      await this.materialRepository.calculateUsedStorage(tenantId);

    const quotaBytes = DEFAULT_STORAGE_QUOTA;
    const availableBytes = Math.max(0, quotaBytes - usedBytes);

    return {
      tenantId,
      quotaBytes,
      usedBytes,
      availableBytes,
    };
  }

  async checkQuota(tenantId: string, additionalSize: number): Promise<void> {
    const usedBytes =
      await this.materialRepository.calculateUsedStorage(tenantId);
    const quotaBytes = DEFAULT_STORAGE_QUOTA;

    if (usedBytes + additionalSize > quotaBytes) {
      throw new BadRequestException(
        `Storage quota exceeded. Used: ${usedBytes} bytes, ` +
          `Quota: ${quotaBytes} bytes, ` +
          `Requested: ${additionalSize} bytes.`,
      );
    }
  }

  // ─── Assignment CRUD ──────────────────────────────────

  async createAssignment(dto: CreateAssignmentDto): Promise<Assignment> {
    const tenantId = this.tenantContext.getTenantId();
    const branchId = this.tenantContext.getBranchId() ?? dto.branchId ?? null;

    return this.assignmentRepository.create({
      ...dto,
      tenantId,
      branchId,
      dueDate: new Date(dto.dueDate),
    });
  }

  async findAllAssignments(): Promise<Assignment[]> {
    return this.assignmentRepository.findAll();
  }

  async findOneAssignment(id: number): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findById(id);
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    return assignment;
  }

  async updateAssignment(
    id: number,
    dto: UpdateAssignmentDto,
  ): Promise<NullableType<Assignment>> {
    await this.findOneAssignment(id);
    const payload: any = { ...dto };
    if (dto.dueDate) {
      payload.dueDate = new Date(dto.dueDate);
    }
    return this.assignmentRepository.update(id, payload);
  }

  async removeAssignment(id: number): Promise<void> {
    await this.findOneAssignment(id);
    return this.assignmentRepository.remove(id);
  }

  // ─── Assignment Submission ────────────────────────────

  async submitAssignment(
    assignmentId: number,
    dto: SubmitAssignmentDto,
  ): Promise<AssignmentSubmission> {
    // Verify assignment exists (tenant-scoped via repository)
    await this.findOneAssignment(assignmentId);

    const tenantId = this.tenantContext.getTenantId();
    const branchId = this.tenantContext.getBranchId() ?? dto.branchId ?? null;

    // Check quota for submission file
    if (dto.fileSize) {
      await this.checkQuota(tenantId, dto.fileSize);
    }

    return this.submissionRepository.create({
      assignmentId,
      studentId: dto.studentId,
      filePath: dto.filePath ?? null,
      fileSize: dto.fileSize ?? 0,
      remarks: dto.remarks ?? null,
      marks: null,
      submittedAt: new Date(),
      tenantId,
      branchId,
    });
  }

  async findOneSubmission(id: number): Promise<AssignmentSubmission> {
    const submission = await this.submissionRepository.findById(id);
    if (!submission) {
      throw new NotFoundException('Assignment submission not found');
    }
    return submission;
  }

  async findSubmissionsByAssignment(
    assignmentId: number,
  ): Promise<AssignmentSubmission[]> {
    await this.findOneAssignment(assignmentId);
    return this.submissionRepository.findByAssignmentId(assignmentId);
  }

  async removeSubmission(id: number): Promise<void> {
    await this.findOneSubmission(id);
    return this.submissionRepository.remove(id);
  }
}
