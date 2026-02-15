import { Injectable, NotFoundException } from '@nestjs/common';
import { NoticesRepository } from './infrastructure/persistence/notices.repository';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { TenantContextService } from '../tenant/tenant-context/tenant-context.service';
import { Notice } from './domain/notice';

@Injectable()
export class NoticesService {
  constructor(
    private readonly noticesRepository: NoticesRepository,
    private readonly tenantContext: TenantContextService,
  ) {}

  // ─── Create ────────────────────────────────────────────
  async create(dto: CreateNoticeDto): Promise<Notice> {
    const tenantId = this.tenantContext.getTenantId();
    const branchId = this.tenantContext.getBranchId() ?? null;

    return this.noticesRepository.create({
      ...dto,
      tenantId,
      branchId, // Track which branch created the notice
      targetBranches: dto.targetBranches ?? [],
      targetRoles: dto.targetRoles ?? [],
      attachments: dto.attachments ?? null,
      isPublished: dto.isPublished ?? false,
      publishDate: dto.publishDate ? new Date(dto.publishDate) : null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    } as any);
  }

  // ─── Find All (tenant-scoped) ─────────────────────────
  async findAll(): Promise<Notice[]> {
    return this.noticesRepository.findAll();
  }

  // ─── Find One ──────────────────────────────────────────
  async findOne(id: string): Promise<Notice> {
    const notice = await this.noticesRepository.findById(id);
    if (!notice) {
      throw new NotFoundException(`Notice not found: ${id}`);
    }
    return notice;
  }

  // ─── Find by Branch ───────────────────────────────────
  async findByBranch(branchId: string): Promise<Notice[]> {
    return this.noticesRepository.findByBranch(branchId);
  }

  // ─── My Notices ───────────────────────────────────────
  async findMyNotices(
    userBranches: string[],
    userRole: string,
  ): Promise<Notice[]> {
    return this.noticesRepository.findMyNotices({
      userBranches,
      userRoles: [userRole],
    });
  }

  // ─── Update ───────────────────────────────────────────
  async update(id: string, dto: UpdateNoticeDto): Promise<Notice> {
    await this.findOne(id);

    const updatePayload: Record<string, any> = { ...dto };
    if (dto.publishDate !== undefined) {
      updatePayload.publishDate = dto.publishDate
        ? new Date(dto.publishDate)
        : null;
    }
    if (dto.expiresAt !== undefined) {
      updatePayload.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    }

    const updated = await this.noticesRepository.update(id, updatePayload);
    if (!updated) {
      throw new NotFoundException(`Notice not found after update: ${id}`);
    }
    return updated;
  }

  // ─── Remove ───────────────────────────────────────────
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.noticesRepository.remove(id);
  }
}
