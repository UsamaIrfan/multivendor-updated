import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { StaffMgmtRepository } from './infrastructure/persistence/staff-mgmt.repository';
import { StaffBranchAssignmentRepository } from './infrastructure/persistence/staff-branch-assignment.repository';
import { TenantRepository } from '../tenant/infrastructure/persistence/tenant.repository';
import { BranchRepository } from '../tenant/infrastructure/persistence/branch.repository';
import { TenantContextService } from '../tenant/tenant-context/tenant-context.service';
import { UsersService } from '../users/users.service';
import { CreateStaffMgmtDto } from './dto/create-staff-mgmt.dto';
import { UpdateStaffMgmtDto } from './dto/update-staff-mgmt.dto';
import { AssignBranchDto } from './dto/assign-branch.dto';
import { TransferBranchDto } from './dto/transfer-branch.dto';
import { StaffMgmt } from './domain/staff-mgmt';
import { StaffBranchAssignment } from './domain/staff-branch-assignment';
import { RoleEnum } from '../roles/roles.enum';
import { StatusEnum } from '../statuses/statuses.enum';

const USER_ROLE_MAP: Record<string, RoleEnum> = {
  teacher: RoleEnum.teacher,
  staff: RoleEnum.staff,
  accountant: RoleEnum.accountant,
};

@Injectable()
export class StaffManagementService {
  constructor(
    private readonly staffRepo: StaffMgmtRepository,
    private readonly assignmentRepo: StaffBranchAssignmentRepository,
    private readonly tenantRepo: TenantRepository,
    private readonly branchRepo: BranchRepository,
    private readonly tenantContext: TenantContextService,
    private readonly usersService: UsersService,
  ) {}

  // ─── Create Staff ──────────────────────────────────────
  async create(dto: CreateStaffMgmtDto): Promise<StaffMgmt> {
    const tenantId = dto.tenantId || this.tenantContext.getTenantId();
    const branchId =
      dto.branchId || this.tenantContext.getBranchId() || undefined;

    // Resolve or auto-create the user
    let resolvedUserId: number;

    if (dto.userId) {
      resolvedUserId = dto.userId;
    } else if (dto.email && dto.password && dto.firstName && dto.lastName) {
      // Auto-create a user account with the appropriate role
      const role = USER_ROLE_MAP[dto.userRole ?? 'staff'] ?? RoleEnum.staff;

      const user = await this.usersService.create({
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: { id: role },
        status: { id: StatusEnum.active },
      });
      resolvedUserId = user.id as number;
    } else {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          userId:
            'Provide either userId or (email + password + firstName + lastName) to auto-create a user',
        },
      });
    }

    // Generate tenant-scoped staff ID
    const staffId = await this.generateStaffId(tenantId);

    // Determine primary branch
    const primaryBranchId = branchId;

    const staff = await this.staffRepo.create({
      userId: resolvedUserId,
      institutionId: dto.institutionId,
      departmentId: dto.departmentId ?? null,
      staffId,
      tenantId,
      branchId: branchId ?? null,
      primaryBranchId,
      designation: dto.designation ?? null,
      qualification: dto.qualification ?? null,
      specialization: dto.specialization ?? null,
      experienceYears: dto.experienceYears ?? null,
      joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : null,
      basicSalary: dto.basicSalary ?? 0,
      employmentType: dto.employmentType,
      emergencyContact: dto.emergencyContact ?? null,
      address: dto.address ?? null,
    } as any);

    // Create initial branch assignment if branchId is present
    if (primaryBranchId) {
      await this.assignmentRepo.create({
        tenantId,
        staffEntityId: staff.id,
        branchId: primaryBranchId,
        roles: dto.roles ?? [],
        isPrimary: true,
      });
    }

    return staff;
  }

  // ─── Generate Staff ID ────────────────────────────────
  async generateStaffId(tenantId: string): Promise<string> {
    const tenant = await this.tenantRepo.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException(`Tenant not found: ${tenantId}`);
    }

    const year = new Date().getFullYear();
    const prefix = `${tenant.slug}-STF-${year}`;

    const last = await this.staffRepo.findLastByStaffIdPrefix(prefix);

    let sequence = 1;
    if (last?.staffId) {
      const parts = last.staffId.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  // ─── Assign to Branch ─────────────────────────────────
  async assignToBranch(
    staffId: number,
    dto: AssignBranchDto,
  ): Promise<StaffBranchAssignment> {
    const staff = await this.staffRepo.findById(staffId);
    if (!staff) {
      throw new NotFoundException(`Staff not found: ${staffId}`);
    }

    const branch = await this.branchRepo.findById(dto.branchId);
    if (!branch) {
      throw new NotFoundException(`Branch not found: ${dto.branchId}`);
    }

    // Cross-tenant check
    if (branch.tenantId !== staff.tenantId) {
      throw new BadRequestException(
        'Cannot assign staff to a branch in a different tenant',
      );
    }

    // Duplicate check
    const existing = await this.assignmentRepo.findByStaffAndBranch(
      staffId,
      dto.branchId,
    );
    if (existing) {
      throw new BadRequestException('Staff is already assigned to this branch');
    }

    return this.assignmentRepo.create({
      tenantId: staff.tenantId,
      staffEntityId: staffId,
      branchId: dto.branchId,
      roles: dto.roles,
      isPrimary: dto.isPrimary ?? false,
    });
  }

  // ─── Transfer Branch ──────────────────────────────────
  async transferBranch(
    staffId: number,
    dto: TransferBranchDto,
  ): Promise<StaffMgmt> {
    const staff = await this.staffRepo.findById(staffId);
    if (!staff) {
      throw new NotFoundException(`Staff not found: ${staffId}`);
    }

    const toBranch = await this.branchRepo.findById(dto.toBranchId);
    if (!toBranch) {
      throw new NotFoundException(`Branch not found: ${dto.toBranchId}`);
    }

    // Cross-tenant check
    if (toBranch.tenantId !== staff.tenantId) {
      throw new BadRequestException(
        'Cannot transfer staff to a branch in a different tenant',
      );
    }

    // Ensure assignment exists at target, create if not
    const existingAssignment = await this.assignmentRepo.findByStaffAndBranch(
      staffId,
      dto.toBranchId,
    );

    if (!existingAssignment) {
      await this.assignmentRepo.create({
        tenantId: staff.tenantId,
        staffEntityId: staffId,
        branchId: dto.toBranchId,
        roles: [],
        isPrimary: true,
      });
    }

    // Update primary flags
    await this.assignmentRepo.updatePrimaryFlag(staffId, dto.toBranchId, true);

    // Update staff's primary branch
    const updated = await this.staffRepo.update(staffId, {
      primaryBranchId: dto.toBranchId,
    });

    if (!updated) {
      throw new NotFoundException(`Staff not found after update: ${staffId}`);
    }

    return updated;
  }

  // ─── List by Branch ───────────────────────────────────
  async listByBranch(branchId: string): Promise<StaffMgmt[]> {
    return this.staffRepo.findByBranch(branchId);
  }

  // ─── Find All ─────────────────────────────────────────
  async findAll(branchId?: string): Promise<StaffMgmt[]> {
    if (branchId) {
      return this.listByBranch(branchId);
    }
    return this.staffRepo.findAll();
  }

  // ─── Find One ─────────────────────────────────────────
  async findOne(id: number): Promise<StaffMgmt> {
    const staff = await this.staffRepo.findByIdWithAssignments(id);
    if (!staff) {
      throw new NotFoundException(`Staff not found: ${id}`);
    }
    return staff;
  }

  // ─── Update ───────────────────────────────────────────
  async update(id: number, dto: UpdateStaffMgmtDto): Promise<StaffMgmt> {
    const staff = await this.staffRepo.findById(id);
    if (!staff) {
      throw new NotFoundException(`Staff not found: ${id}`);
    }

    const updated = await this.staffRepo.update(id, dto as any);
    if (!updated) {
      throw new NotFoundException(`Staff not found after update: ${id}`);
    }
    return updated;
  }

  // ─── Remove ───────────────────────────────────────────
  async remove(id: number): Promise<void> {
    const staff = await this.staffRepo.findById(id);
    if (!staff) {
      throw new NotFoundException(`Staff not found: ${id}`);
    }
    await this.staffRepo.remove(id);
  }

  // ─── Get My Branches ─────────────────────────────────
  async getMyBranches(userId: number): Promise<StaffBranchAssignment[]> {
    if (!this.tenantContext.hasContext()) {
      return [];
    }
    const tenantId = this.tenantContext.getTenantId();
    return this.assignmentRepo.findByUserAndTenant(userId, tenantId);
  }

  // ─── Remove Branch Assignment ─────────────────────────
  async removeBranchAssignment(assignmentId: number): Promise<void> {
    const assignment = await this.assignmentRepo.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundException(
        `Branch assignment not found: ${assignmentId}`,
      );
    }
    await this.assignmentRepo.remove(assignmentId);
  }
}
