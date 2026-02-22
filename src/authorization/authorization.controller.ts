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
  UseGuards,
  ParseIntPipe,
  Query,
  Request,
  NotFoundException,
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
import { PermissionService } from './services/permission.service';
import { AuditService } from './services/audit.service';
import { Permission } from './domain/permission';
import { AuditLog } from './domain/audit-log';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  CreateRolePermissionDto,
  CreateUserPermissionOverrideDto,
  QueryAuditLogDto,
} from './dto';
import { RolePermissionRepository } from './infrastructure/persistence/role-permission.repository';
import { UserPermissionOverrideRepository } from './infrastructure/persistence/user-permission-override.repository';
import { RolePermission } from './domain/role-permission';
import { UserPermissionOverride } from './domain/user-permission-override';
import { TenantContextService } from '../tenant/tenant-context/tenant-context.service';
import { RequirePermissions } from './decorators/require-permissions.decorator';
import { PermissionsGuard } from './guards/permissions.guard';

// ─── Permission Admin Controller ──────────────────────────

@ApiTags('Authorization - Permissions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Controller({ path: 'authorization/permissions', version: '1' })
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.permission.manage')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: Permission })
  create(@Body() dto: CreatePermissionDto): Promise<Permission> {
    return this.permissionService.createPermission(dto);
  }

  @Get()
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.permission.read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [Permission] })
  findAll(): Promise<Permission[]> {
    return this.permissionService.findAllPermissions();
  }

  @Get('domain/:domain')
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.permission.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'domain', type: String })
  @ApiOkResponse({ type: [Permission] })
  findByDomain(@Param('domain') domain: string): Promise<Permission[]> {
    return this.permissionService.findPermissionsByDomain(domain);
  }

  @Get(':id')
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.permission.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Permission })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Permission> {
    const perm = await this.permissionService.findPermissionById(id);
    if (!perm) {
      throw new NotFoundException(`Permission not found: ${id}`);
    }
    return perm;
  }

  @Patch(':id')
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.permission.manage')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Permission })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePermissionDto,
  ): Promise<Permission> {
    const updated = await this.permissionService.updatePermission(id, dto);
    if (!updated) {
      throw new NotFoundException(`Permission not found: ${id}`);
    }
    return updated;
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.permission.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.permissionService.removePermission(id);
  }
}

// ─── Role Permission Mapping Controller ───────────────────

@ApiTags('Authorization - Role Permissions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Controller({ path: 'authorization/role-permissions', version: '1' })
export class RolePermissionController {
  constructor(
    private readonly rolePermissionRepo: RolePermissionRepository,
    private readonly permissionService: PermissionService,
  ) {}

  @Post()
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.role.manage')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: RolePermission })
  async create(@Body() dto: CreateRolePermissionDto): Promise<RolePermission> {
    const rp = await this.rolePermissionRepo.create(dto);
    // Invalidate cache for all users with this role
    this.permissionService.invalidateCache(dto.roleId);
    return rp;
  }

  @Get('role/:roleId')
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.role.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'roleId', type: Number })
  @ApiOkResponse({ type: [RolePermission] })
  findByRole(
    @Param('roleId', ParseIntPipe) roleId: number,
  ): Promise<RolePermission[]> {
    return this.rolePermissionRepo.findByRoleId(roleId);
  }

  @Delete('role/:roleId/permission/:permissionId')
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.role.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'roleId', type: Number })
  @ApiParam({ name: 'permissionId', type: Number })
  async remove(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ): Promise<void> {
    await this.rolePermissionRepo.remove(roleId, permissionId);
    this.permissionService.invalidateCache(roleId);
  }
}

// ─── User Permission Override Controller ──────────────────

@ApiTags('Authorization - User Overrides')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Controller({ path: 'authorization/user-overrides', version: '1' })
export class UserPermissionOverrideController {
  constructor(
    private readonly userOverrideRepo: UserPermissionOverrideRepository,
    private readonly permissionService: PermissionService,
    private readonly tenantContext: TenantContextService,
  ) {}

  @Post()
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.user_override.manage')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: UserPermissionOverride })
  async create(
    @Body() dto: CreateUserPermissionOverrideDto,
    @Request() req: any,
  ): Promise<UserPermissionOverride> {
    const ov = await this.userOverrideRepo.create({
      ...dto,
      grantedBy: req.user?.id ?? null,
    });
    // Invalidate cache for the target user
    this.permissionService.invalidateCache(undefined, dto.userId, dto.tenantId);
    return ov;
  }

  @Get('user/:userId')
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.user_override.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'userId', type: Number })
  @ApiOkResponse({ type: [UserPermissionOverride] })
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserPermissionOverride[]> {
    const tenantId = this.tenantContext.getTenantId();
    return this.userOverrideRepo.findByUserAndTenant(userId, tenantId);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.user_override.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userOverrideRepo.remove(id);
  }
}

// ─── Audit Log Controller ─────────────────────────────────

@ApiTags('Authorization - Audit Logs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Controller({ path: 'authorization/audit-logs', version: '1' })
export class AuditLogController {
  constructor(
    private readonly auditService: AuditService,
    private readonly tenantContext: TenantContextService,
  ) {}

  @Get()
  @Roles(RoleEnum.admin)
  @RequirePermissions('system.audit.read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [AuditLog] })
  findAll(@Query() query: QueryAuditLogDto): Promise<AuditLog[]> {
    const tenantId = this.tenantContext.getTenantId();
    return this.auditService.findByTenant(tenantId, {
      userId: query.userId,
      action: query.action,
      resourceType: query.resourceType,
      limit: query.limit ?? 50,
      offset: query.offset ?? 0,
    });
  }
}

// ─── Current User Permissions Controller ──────────────────

@ApiTags('Authorization')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'authorization/me', version: '1' })
export class AuthorizationMeController {
  constructor(private readonly permissionService: PermissionService) {}

  /**
   * Returns the current user's effective permissions.
   * Used by the frontend to build the permission-based UI.
   */
  @Get('permissions')
  @Roles(
    RoleEnum.admin,
    RoleEnum.user,
    RoleEnum.student,
    RoleEnum.teacher,
    RoleEnum.staff,
    RoleEnum.accountant,
    RoleEnum.parent,
  )
  @HttpCode(HttpStatus.OK)
  getMyPermissions(@Request() req: any) {
    const authCtx = req.authorizationContext;
    if (!authCtx) {
      return { permissions: [] };
    }
    return {
      permissions: this.permissionService.toEffectivePermissionArray(
        authCtx.permissions,
      ),
    };
  }
}
