import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { RoleEnum } from '../roles/roles.enum';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { RequirePermissions } from '../authorization/decorators/require-permissions.decorator';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { AssignUserToTenantDto } from './dto/assign-user-to-tenant.dto';
import { Tenant } from './domain/tenant';
import { Branch } from './domain/branch';
import { TenantUser } from './domain/tenant-user';

// ═══════════════════════════════════════════════════════════
//  Tenants  (super-admin only)
// ═══════════════════════════════════════════════════════════
@ApiTags('Multi-Tenancy - Tenants')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Controller({ path: 'tenants', version: '1' })
export class TenantController {
  constructor(private readonly service: TenantService) {}

  @Post()
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.tenant.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: Tenant })
  create(@Body() dto: CreateTenantDto) {
    return this.service.createTenant(dto);
  }

  @Get()
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.tenant.read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [Tenant] })
  findAll() {
    return this.service.findAllTenants();
  }

  @Get(':id')
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.tenant.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: Tenant })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOneTenant(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.tenant.update')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: Tenant })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTenantDto) {
    return this.service.updateTenant(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.tenant.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.removeTenant(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Branches  (tenant admin)
// ═══════════════════════════════════════════════════════════
@ApiTags('Multi-Tenancy - Branches')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Controller({ path: 'branches', version: '1' })
export class BranchController {
  constructor(private readonly service: TenantService) {}

  @Post()
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.branch.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: Branch })
  create(@Body() dto: CreateBranchDto) {
    return this.service.createBranch(dto);
  }

  @Get('tenant/:tenantId')
  @Roles(
    RoleEnum.admin,
    RoleEnum.user,
    RoleEnum.student,
    RoleEnum.teacher,
    RoleEnum.staff,
    RoleEnum.accountant,
    RoleEnum.parent,
  )
  @RequirePermissions('system.branch.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'tenantId', type: String })
  @ApiOkResponse({ type: [Branch] })
  findAllByTenant(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.service.findAllBranches(tenantId);
  }

  @Get(':id')
  @Roles(
    RoleEnum.admin,
    RoleEnum.user,
    RoleEnum.student,
    RoleEnum.teacher,
    RoleEnum.staff,
    RoleEnum.accountant,
    RoleEnum.parent,
  )
  @RequirePermissions('system.branch.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: Branch })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOneBranch(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.branch.update')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: Branch })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBranchDto) {
    return this.service.updateBranch(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.branch.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.removeBranch(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Tenant Users  (user-tenant assignment)
// ═══════════════════════════════════════════════════════════
@ApiTags('Multi-Tenancy - Tenant Users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Controller({ path: 'tenant-users', version: '1' })
export class TenantUserController {
  constructor(private readonly service: TenantService) {}

  @Post()
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.tenant.update')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: TenantUser })
  assign(@Body() dto: AssignUserToTenantDto) {
    return this.service.assignUserToTenant(dto);
  }

  @Get('user/:userId')
  @Roles(
    RoleEnum.admin,
    RoleEnum.user,
    RoleEnum.student,
    RoleEnum.teacher,
    RoleEnum.staff,
    RoleEnum.accountant,
    RoleEnum.parent,
  )
  @RequirePermissions('system.tenant.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'userId', type: Number })
  @ApiOkResponse({ type: [TenantUser] })
  findTenantsByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.findTenantsByUser(userId);
  }

  @Get('tenant/:tenantId')
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.tenant.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'tenantId', type: String })
  @ApiOkResponse({ type: [TenantUser] })
  findUsersByTenant(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.service.findUsersByTenant(tenantId);
  }

  @Delete(':tenantId/user/:userId')
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.tenant.update')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'tenantId', type: String })
  @ApiParam({ name: 'userId', type: Number })
  removeUserFromTenant(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.service.removeUserFromTenant(tenantId, userId);
  }
}
