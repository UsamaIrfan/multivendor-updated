import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { RoleEnum } from '../roles/roles.enum';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { RequireTenantGuard } from '../tenant/guards/require-tenant.guard';
import { RequirePermissions } from '../authorization/decorators/require-permissions.decorator';
import { StaffManagementService } from './staff-management.service';
import { CreateStaffMgmtDto } from './dto/create-staff-mgmt.dto';
import { UpdateStaffMgmtDto } from './dto/update-staff-mgmt.dto';
import { AssignBranchDto } from './dto/assign-branch.dto';
import { TransferBranchDto } from './dto/transfer-branch.dto';
import { QueryStaffDto } from './dto/query-staff.dto';
import { StaffMgmt } from './domain/staff-mgmt';
import { StaffBranchAssignment } from './domain/staff-branch-assignment';

// ═══════════════════════════════════════════════════════════
//  Staff Management
// ═══════════════════════════════════════════════════════════
@ApiTags('Staff Management')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard, RequireTenantGuard)
@Controller({ path: 'staff-management', version: '1' })
export class StaffManagementController {
  constructor(private readonly service: StaffManagementService) {}

  // ─── CRUD ──────────────────────────────────────────────

  @Post()
  @Roles(RoleEnum.admin)
  @RequirePermissions('hr.staff.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: StaffMgmt })
  create(@Body() dto: CreateStaffMgmtDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @RequirePermissions('hr.staff.read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [StaffMgmt] })
  findAll(@Query() query: QueryStaffDto) {
    return this.service.findAll(query.branchId);
  }

  // ─── My Branches (MUST be before :id) ─────────────────

  @Get('my-branches')
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher, RoleEnum.accountant)
  @RequirePermissions('hr.branch_assignment.read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [StaffBranchAssignment] })
  getMyBranches(@Request() req: any) {
    return this.service.getMyBranches(req.user.id);
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @RequirePermissions('hr.staff.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: StaffMgmt })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin)
  @RequirePermissions('hr.staff.update')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: StaffMgmt })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffMgmtDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @RequirePermissions('hr.staff.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // ─── Branch Assignments ───────────────────────────────

  @Post(':id/branches')
  @Roles(RoleEnum.admin)
  @RequirePermissions('hr.branch_assignment.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiParam({ name: 'id', type: Number })
  @ApiCreatedResponse({ type: StaffBranchAssignment })
  assignToBranch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignBranchDto,
  ) {
    return this.service.assignToBranch(id, dto);
  }

  @Get(':id/branches')
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @RequirePermissions('hr.branch_assignment.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: [StaffBranchAssignment] })
  getStaffBranches(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id).then((s) => s.branchAssignments ?? []);
  }

  @Post(':id/transfer-branch')
  @Roles(RoleEnum.admin)
  @RequirePermissions('hr.branch_transfer.create')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: StaffMgmt })
  transferBranch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TransferBranchDto,
  ) {
    return this.service.transferBranch(id, dto);
  }

  // ─── Delete Branch Assignment ─────────────────────────

  @Delete('branch-assignments/:id')
  @Roles(RoleEnum.admin)
  @RequirePermissions('hr.branch_assignment.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse()
  removeBranchAssignment(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeBranchAssignment(id);
  }
}
