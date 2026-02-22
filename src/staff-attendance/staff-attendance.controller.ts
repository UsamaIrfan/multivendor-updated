import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
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
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { RequireTenantGuard } from '../tenant/guards/require-tenant.guard';
import { RequirePermissions } from '../authorization/decorators/require-permissions.decorator';
import { StaffAttendanceService } from './staff-attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { QueryAttendanceReportDto } from './dto/query-attendance-report.dto';
import { ApplyStaffLeaveDto } from './dto/apply-staff-leave.dto';
import {
  ApproveStaffLeaveDto,
  RejectStaffLeaveDto,
} from './dto/approve-staff-leave.dto';
import { QueryStaffLeaveDto } from './dto/query-staff-leave.dto';
import { QueryLeaveBalanceDto } from './dto/query-leave-balance.dto';
import { StaffAttendanceRecord } from './domain/staff-attendance-record';
import { StaffLeaveApplication } from './domain/staff-leave-application';
import { StaffLeaveBalance } from './domain/staff-leave-balance';

// ═══════════════════════════════════════════════════════════
// Staff Attendance Controller (check-in / check-out / reports)
// ═══════════════════════════════════════════════════════════

@ApiTags('Staff - Attendance')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard, RequireTenantGuard)
@Controller({ path: 'staff/attendance', version: '1' })
export class StaffAttendanceCheckController {
  constructor(private readonly service: StaffAttendanceService) {}

  @Post('check-in')
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @RequirePermissions('hr.attendance.check_in')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: StaffAttendanceRecord })
  checkIn(@Body() dto: CheckInDto): Promise<StaffAttendanceRecord> {
    return this.service.checkIn(dto);
  }

  @Post('check-out')
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @RequirePermissions('hr.attendance.check_out')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: StaffAttendanceRecord })
  checkOut(@Body() dto: CheckOutDto): Promise<StaffAttendanceRecord> {
    return this.service.checkOut(dto);
  }

  @Get('reports')
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @RequirePermissions('hr.attendance.report')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [StaffAttendanceRecord] })
  getReports(
    @Query() query: QueryAttendanceReportDto,
  ): Promise<StaffAttendanceRecord[]> {
    return this.service.getReports(query);
  }
}

// ═══════════════════════════════════════════════════════════
// Staff Leave Controller (apply / list / balance / approve / reject)
// ═══════════════════════════════════════════════════════════

@ApiTags('Staff - Leaves')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard, RequireTenantGuard)
@Controller({ path: 'staff/leaves', version: '1' })
export class StaffLeaveController {
  constructor(private readonly service: StaffAttendanceService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @RequirePermissions('hr.leave.apply')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: StaffLeaveApplication })
  apply(@Body() dto: ApplyStaffLeaveDto): Promise<StaffLeaveApplication> {
    return this.service.applyLeave(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @RequirePermissions('hr.leave.read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [StaffLeaveApplication] })
  findAll(
    @Query() query: QueryStaffLeaveDto,
  ): Promise<StaffLeaveApplication[]> {
    return this.service.getLeaves(query);
  }

  @Get('balance')
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @RequirePermissions('hr.leave.balance')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [StaffLeaveBalance] })
  getBalance(
    @Query() query: QueryLeaveBalanceDto,
  ): Promise<StaffLeaveBalance[]> {
    return this.service.getLeaveBalance(query);
  }

  @Patch(':id/approve')
  @Roles(RoleEnum.admin)
  @RequirePermissions('hr.leave.approve')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: StaffLeaveApplication })
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveStaffLeaveDto,
    @Request() req: any,
  ): Promise<StaffLeaveApplication> {
    return this.service.approveLeave(id, dto, req.user?.id);
  }

  @Patch(':id/reject')
  @Roles(RoleEnum.admin)
  @RequirePermissions('hr.leave.reject')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: StaffLeaveApplication })
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectStaffLeaveDto,
  ): Promise<StaffLeaveApplication> {
    return this.service.rejectLeave(id, dto);
  }
}
