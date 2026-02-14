import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TenantRepository } from './infrastructure/persistence/tenant.repository';
import { BranchRepository } from './infrastructure/persistence/branch.repository';
import { TenantUserRepository } from './infrastructure/persistence/tenant-user.repository';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { AssignUserToTenantDto } from './dto/assign-user-to-tenant.dto';
import { Tenant } from './domain/tenant';
import { Branch } from './domain/branch';
import { TenantUser } from './domain/tenant-user';

@Injectable()
export class TenantService {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly branchRepository: BranchRepository,
    private readonly tenantUserRepository: TenantUserRepository,
  ) {}

  // ─── Tenants ──────────────────────────────────────────

  async createTenant(dto: CreateTenantDto): Promise<Tenant> {
    const existing = await this.tenantRepository.findBySlug(dto.slug);
    if (existing) {
      throw new ConflictException('Tenant with this slug already exists');
    }
    return this.tenantRepository.create({
      ...dto,
      isActive: true,
      settings: null,
      contactEmail: dto.contactEmail ?? null,
      contactPhone: dto.contactPhone ?? null,
    });
  }

  findAllTenants(): Promise<Tenant[]> {
    return this.tenantRepository.findAll();
  }

  async findOneTenant(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async updateTenant(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    await this.findOneTenant(id);
    const updated = await this.tenantRepository.update(id, dto);
    if (!updated) throw new NotFoundException('Tenant not found');
    return updated;
  }

  async removeTenant(id: string): Promise<void> {
    await this.findOneTenant(id);
    return this.tenantRepository.remove(id);
  }

  // ─── Branches ─────────────────────────────────────────

  async createBranch(dto: CreateBranchDto): Promise<Branch> {
    await this.findOneTenant(dto.tenantId);
    const existing = await this.branchRepository.findByTenantAndCode(
      dto.tenantId,
      dto.code,
    );
    if (existing) {
      throw new ConflictException(
        `Branch with code '${dto.code}' already exists for this tenant`,
      );
    }
    return this.branchRepository.create({
      ...dto,
      isActive: true,
      isHeadquarters: false,
      address: dto.address ?? null,
      city: dto.city ?? null,
      state: dto.state ?? null,
      country: dto.country ?? null,
      phone: dto.phone ?? null,
      email: dto.email ?? null,
    });
  }

  findAllBranches(tenantId: string): Promise<Branch[]> {
    return this.branchRepository.findAllByTenant(tenantId);
  }

  async findOneBranch(id: string): Promise<Branch> {
    const branch = await this.branchRepository.findById(id);
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async updateBranch(id: string, dto: UpdateBranchDto): Promise<Branch> {
    await this.findOneBranch(id);
    const updated = await this.branchRepository.update(id, dto);
    if (!updated) throw new NotFoundException('Branch not found');
    return updated;
  }

  async removeBranch(id: string): Promise<void> {
    await this.findOneBranch(id);
    return this.branchRepository.remove(id);
  }

  // ─── Tenant Users ─────────────────────────────────────

  async assignUserToTenant(dto: AssignUserToTenantDto): Promise<TenantUser> {
    await this.findOneTenant(dto.tenantId);
    const existing = await this.tenantUserRepository.findByTenantAndUser(
      dto.tenantId,
      dto.userId,
    );
    if (existing) {
      // Reactivate if soft-deleted, otherwise conflict
      if (existing.deletedAt) {
        const restored = await this.tenantUserRepository.restore(existing.id);
        return restored ?? existing;
      }
      throw new ConflictException('User is already assigned to this tenant');
    }
    return this.tenantUserRepository.create({
      tenantId: dto.tenantId,
      userId: dto.userId,
      isActive: true,
    });
  }

  findTenantsByUser(userId: number): Promise<TenantUser[]> {
    return this.tenantUserRepository.findAllByUser(userId);
  }

  findUsersByTenant(tenantId: string): Promise<TenantUser[]> {
    return this.tenantUserRepository.findAllByTenant(tenantId);
  }

  async removeUserFromTenant(
    tenantId: string,
    userId: number,
  ): Promise<void> {
    const tenantUser = await this.tenantUserRepository.findByTenantAndUser(
      tenantId,
      userId,
    );
    if (!tenantUser) {
      throw new NotFoundException('User is not assigned to this tenant');
    }
    return this.tenantUserRepository.remove(tenantUser.id);
  }
}
