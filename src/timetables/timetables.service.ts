import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TimetableRepository } from './infrastructure/persistence/timetable.repository';
import { PeriodRepository } from './infrastructure/persistence/period.repository';
import { StaffBranchAssignmentRepository } from '../staff-management/infrastructure/persistence/staff-branch-assignment.repository';
import { TenantContextService } from '../tenant/tenant-context/tenant-context.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { AddPeriodDto } from './dto/add-period.dto';
import { Timetable } from './domain/timetable';
import { Period } from './domain/period';

@Injectable()
export class TimetablesService {
  constructor(
    private readonly timetableRepo: TimetableRepository,
    private readonly periodRepo: PeriodRepository,
    private readonly staffBranchRepo: StaffBranchAssignmentRepository,
    private readonly tenantContext: TenantContextService,
  ) {}

  // ─── Timetable CRUD ──────────────────────────────────

  async create(dto: CreateTimetableDto): Promise<Timetable> {
    const tenantId = this.tenantContext.getTenantId();
    return this.timetableRepo.create({
      ...dto,
      tenantId,
      branchId: dto.branchId,
      name: dto.name ?? null,
      isActive: dto.isActive ?? true,
    } as any);
  }

  async findAll(): Promise<Timetable[]> {
    return this.timetableRepo.findAll();
  }

  async findOne(id: string): Promise<Timetable> {
    const timetable = await this.timetableRepo.findById(id);
    if (!timetable) {
      throw new NotFoundException(`Timetable not found: ${id}`);
    }
    return timetable;
  }

  async findByBranch(branchId: string): Promise<Timetable[]> {
    return this.timetableRepo.findByBranch(branchId);
  }

  async update(id: string, dto: UpdateTimetableDto): Promise<Timetable> {
    await this.findOne(id);
    const updated = await this.timetableRepo.update(id, dto as any);
    if (!updated) {
      throw new NotFoundException(`Timetable not found after update: ${id}`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.timetableRepo.remove(id);
  }

  // ─── Period Management ────────────────────────────────

  async addPeriod(dto: AddPeriodDto): Promise<Period> {
    const tenantId = this.tenantContext.getTenantId();

    // Verify timetable exists and get its branchId
    const timetable = await this.findOne(dto.timetableId);
    const branchId = timetable.branchId;

    // Verify teacher is assigned to this branch
    const assignments = await this.staffBranchRepo.findByUserAndTenant(
      // teacherId here is the userId (integer)
      dto.teacherId,
      tenantId,
    );

    const isTeacherInBranch = assignments.some((a) => a.branchId === branchId);

    if (!isTeacherInBranch && assignments.length > 0) {
      throw new BadRequestException('Teacher is not assigned to this branch');
    }

    // Check teacher time conflicts across ALL branches within tenant
    const teacherConflicts = await this.periodRepo.findConflicts({
      tenantId,
      teacherId: dto.teacherId,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
    });

    if (teacherConflicts.length > 0) {
      throw new ConflictException(
        'Teacher has a conflicting period at this time',
      );
    }

    // Check room conflicts within the same branch
    if (dto.room) {
      const roomConflicts = await this.periodRepo.findRoomConflicts(
        tenantId,
        branchId,
        dto.room,
        dto.dayOfWeek,
        dto.startTime,
        dto.endTime,
      );

      if (roomConflicts.length > 0) {
        throw new ConflictException(
          'Room is already booked at this time in this branch',
        );
      }
    }

    return this.periodRepo.create({
      ...dto,
      tenantId,
      branchId,
      room: dto.room ?? null,
    } as any);
  }

  async findPeriodsByTimetable(timetableId: string): Promise<Period[]> {
    await this.findOne(timetableId); // Verify timetable exists
    return this.periodRepo.findByTimetable(timetableId);
  }

  async findPeriod(id: string): Promise<Period> {
    const period = await this.periodRepo.findById(id);
    if (!period) {
      throw new NotFoundException(`Period not found: ${id}`);
    }
    return period;
  }

  async removePeriod(id: string): Promise<void> {
    await this.findPeriod(id);
    await this.periodRepo.remove(id);
  }

  // ─── Conflict Detection ───────────────────────────────

  async checkConflicts(
    teacherId: number,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
  ): Promise<Period[]> {
    const tenantId = this.tenantContext.getTenantId();
    return this.periodRepo.findConflicts({
      tenantId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
    });
  }
}
