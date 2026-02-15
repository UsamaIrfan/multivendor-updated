import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { NoticeEntity } from '../entities/notice.entity';
import { Notice } from '../../../../domain/notice';
import {
  FindMyNoticesOptions,
  NoticesRepository,
} from '../../notices.repository';
import { NoticeMapper } from '../mappers/notice.mapper';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class NoticesRelationalRepository implements NoticesRepository {
  constructor(
    @InjectRepository(NoticeEntity)
    private readonly repo: Repository<NoticeEntity>,
    private readonly tenantContext: TenantContextService,
  ) {}

  private getTenantFilter(): Record<string, unknown> {
    if (this.tenantContext.hasContext()) {
      const filter: Record<string, unknown> = {
        tenantId: this.tenantContext.getTenantId(),
      };
      const branchId = this.tenantContext.getBranchId();
      if (branchId) filter.branchId = branchId;
      return filter;
    }
    return {};
  }

  async create(data: DeepPartial<Notice>): Promise<Notice> {
    const entity = this.repo.create(data as any) as unknown as NoticeEntity;
    if (this.tenantContext.hasContext()) {
      entity.tenantId = this.tenantContext.getTenantId();
      entity.branchId = this.tenantContext.getBranchId() ?? null;
    }
    // Ensure arrays default to empty
    if (!entity.targetBranches) entity.targetBranches = [];
    if (!entity.targetRoles) entity.targetRoles = [];
    const saved = await this.repo.save(entity);
    return NoticeMapper.toDomain(saved);
  }

  async findAll(): Promise<Notice[]> {
    const tenantId = this.tenantContext.hasContext()
      ? this.tenantContext.getTenantId()
      : undefined;
    if (!tenantId) {
      const entities = await this.repo.find({
        order: { createdAt: 'DESC' },
      });
      return entities.map(NoticeMapper.toDomain);
    }

    const entities = await this.repo.find({
      where: { tenantId } as any,
      order: { createdAt: 'DESC' },
    });
    return entities.map(NoticeMapper.toDomain);
  }

  async findById(id: Notice['id']): Promise<NullableType<Notice>> {
    const tenantFilter = this.getTenantFilter();
    const entity = await this.repo.findOne({
      where: { id, ...tenantFilter } as any,
    });
    return entity ? NoticeMapper.toDomain(entity) : null;
  }

  async findByBranch(branchId: string): Promise<Notice[]> {
    const tenantId = this.tenantContext.hasContext()
      ? this.tenantContext.getTenantId()
      : undefined;

    const qb = this.repo.createQueryBuilder('notice');
    if (tenantId) {
      qb.where('notice.tenantId = :tenantId', { tenantId });
    }

    // Show tenant-wide notices (empty targetBranches) + branch-specific ones
    qb.andWhere(
      new Brackets((sub) => {
        sub
          .where("notice.targetBranches = ''")
          .orWhere('notice.targetBranches = :empty', { empty: '' })
          .orWhere('notice.targetBranches LIKE :branchPattern', {
            branchPattern: `%${branchId}%`,
          });
      }),
    );

    qb.orderBy('notice.createdAt', 'DESC');
    const entities = await qb.getMany();
    return entities.map(NoticeMapper.toDomain);
  }

  async findMyNotices(options: FindMyNoticesOptions): Promise<Notice[]> {
    const tenantId = this.tenantContext.hasContext()
      ? this.tenantContext.getTenantId()
      : undefined;

    const qb = this.repo.createQueryBuilder('notice');
    if (tenantId) {
      qb.where('notice.tenantId = :tenantId', { tenantId });
    }

    // Branch targeting: tenant-wide (empty targetBranches) OR user's branches
    qb.andWhere(
      new Brackets((sub) => {
        sub
          .where("notice.targetBranches = ''")
          .orWhere('notice.targetBranches = :empty', { empty: '' });

        if (options.userBranches.length > 0) {
          // Match any of user's branches in the simple-array column
          options.userBranches.forEach((branch, idx) => {
            sub.orWhere(`notice.targetBranches LIKE :branch_${idx}`, {
              [`branch_${idx}`]: `%${branch}%`,
            });
          });
        }
      }),
    );

    // Role targeting: all roles (empty targetRoles) OR user's roles
    qb.andWhere(
      new Brackets((sub) => {
        sub
          .where("notice.targetRoles = ''")
          .orWhere('notice.targetRoles = :emptyRole', { emptyRole: '' });

        if (options.userRoles.length > 0) {
          options.userRoles.forEach((role, idx) => {
            sub.orWhere(`notice.targetRoles LIKE :role_${idx}`, {
              [`role_${idx}`]: `%${role}%`,
            });
          });
        }
      }),
    );

    // Only published & non-expired
    qb.andWhere('notice.isPublished = :published', { published: true });
    qb.andWhere(
      new Brackets((sub) => {
        sub
          .where('notice.expiresAt IS NULL')
          .orWhere('notice.expiresAt > :now', { now: new Date() });
      }),
    );

    qb.orderBy('notice.createdAt', 'DESC');
    const entities = await qb.getMany();
    return entities.map(NoticeMapper.toDomain);
  }

  async update(
    id: Notice['id'],
    data: DeepPartial<Notice>,
  ): Promise<Notice | null> {
    await this.repo.update(id, data as any);
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? NoticeMapper.toDomain(entity) : null;
  }

  async remove(id: Notice['id']): Promise<void> {
    await this.repo.softDelete({
      id,
      ...this.getTenantFilter(),
    } as any);
  }
}
