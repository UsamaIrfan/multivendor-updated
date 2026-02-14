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
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { RoleEnum } from '../roles/roles.enum';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { ApplyLeaveDto } from './dto/apply-leave.dto';
import { ApproveLeaveDto, RejectLeaveDto } from './dto/approve-leave.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import {
  AttendanceSummaryQueryDto,
  AlertsQueryDto,
  DetailedReportQueryDto,
} from './dto/attendance-summary.dto';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'attendance', version: '1' })
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  // ─── POST /mark — Individual Attendance ───────────────
  @Post('mark')
  @Roles(RoleEnum.admin, RoleEnum.teacher, RoleEnum.staff)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Attendance marked successfully' })
  async mark(@Body() dto: MarkAttendanceDto) {
    return this.service.markAttendance(dto);
  }

  // ─── POST /bulk — Bulk Attendance ─────────────────────
  @Post('bulk')
  @Roles(RoleEnum.admin, RoleEnum.teacher, RoleEnum.staff)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Bulk attendance marked' })
  async bulk(@Body() dto: BulkAttendanceDto) {
    return this.service.bulkMarkAttendance(dto);
  }

  // ─── GET / — Query Attendance ─────────────────────────
  @Get()
  @Roles(
    RoleEnum.admin,
    RoleEnum.teacher,
    RoleEnum.staff,
    RoleEnum.student,
    RoleEnum.parent,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Attendance records retrieved' })
  async query(@Query() query: QueryAttendanceDto) {
    return this.service.getAttendance(query);
  }

  // ─── GET /reports/summary — Summary Report ────────────
  @Get('reports/summary')
  @Roles(
    RoleEnum.admin,
    RoleEnum.teacher,
    RoleEnum.staff,
    RoleEnum.student,
    RoleEnum.parent,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Attendance summary generated' })
  async summary(@Query() query: AttendanceSummaryQueryDto) {
    return this.service.getSummary(query);
  }

  // ─── GET /reports/detailed — Detailed Report ──────────
  @Get('reports/detailed')
  @Roles(
    RoleEnum.admin,
    RoleEnum.teacher,
    RoleEnum.staff,
    RoleEnum.student,
    RoleEnum.parent,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Detailed attendance report' })
  async detailed(@Query() query: DetailedReportQueryDto) {
    return this.service.getDetailedReport(query);
  }

  // ─── GET /alerts — Low Attendance Alerts ──────────────
  @Get('alerts')
  @Roles(RoleEnum.admin, RoleEnum.teacher, RoleEnum.staff)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Low attendance alerts' })
  async alerts(@Query() query: AlertsQueryDto) {
    return this.service.getAlerts(query);
  }

  // ─── POST /leaves — Apply for Leave ───────────────────
  @Post('leaves')
  @Roles(
    RoleEnum.admin,
    RoleEnum.teacher,
    RoleEnum.staff,
    RoleEnum.student,
    RoleEnum.parent,
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Leave application created' })
  async applyLeave(@Body() dto: ApplyLeaveDto) {
    return this.service.applyLeave(dto);
  }

  // ─── PATCH /leaves/:id/approve — Approve Leave ────────
  @Patch('leaves/:id/approve')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Leave approved' })
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveLeaveDto,
    @Query('attendableType') attendableType: 'student' | 'staff',
    @Request() req: any,
  ) {
    // Try to determine attendableType — if not specified, try student first
    const type = attendableType || 'student';
    try {
      return await this.service.approveLeave(id, type, {
        adminRemarks: dto.adminRemarks,
        approvedById: req.user?.id ?? dto.approvedById,
      });
    } catch (err) {
      // If student not found and type was auto-detected, try staff
      if (
        !attendableType &&
        err instanceof Error &&
        err.message?.includes('not found')
      ) {
        return this.service.approveLeave(id, 'staff', {
          adminRemarks: dto.adminRemarks,
          approvedById: req.user?.id ?? dto.approvedById,
        });
      }
      throw err;
    }
  }

  // ─── PATCH /leaves/:id/reject — Reject Leave ─────────
  @Patch('leaves/:id/reject')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Leave rejected' })
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectLeaveDto,
    @Query('attendableType') attendableType: 'student' | 'staff',
  ) {
    const type = attendableType || 'student';
    try {
      return await this.service.rejectLeave(id, type, {
        adminRemarks: dto.adminRemarks,
      });
    } catch (err) {
      if (
        !attendableType &&
        err instanceof Error &&
        err.message?.includes('not found')
      ) {
        return this.service.rejectLeave(id, 'staff', {
          adminRemarks: dto.adminRemarks,
        });
      }
      throw err;
    }
  }
}
