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
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { RoleEnum } from '../roles/roles.enum';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { RequireTenantGuard } from '../tenant/guards/require-tenant.guard';
import { RequirePermissions } from '../authorization/decorators/require-permissions.decorator';
import { TimetablesService } from './timetables.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { AddPeriodDto } from './dto/add-period.dto';
import { Timetable } from './domain/timetable';
import { Period } from './domain/period';

@ApiTags('Timetables')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard, RequireTenantGuard)
@Controller({ path: 'timetables', version: '1' })
export class TimetablesController {
  constructor(private readonly service: TimetablesService) {}

  // ─── Timetable CRUD ──────────────────────────────────

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @RequirePermissions('academic.timetable.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: Timetable })
  create(@Body() dto: CreateTimetableDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(
    RoleEnum.admin,
    RoleEnum.staff,
    RoleEnum.teacher,
    RoleEnum.student,
    RoleEnum.parent,
  )
  @RequirePermissions('academic.timetable.read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [Timetable] })
  findAll() {
    return this.service.findAll();
  }

  @Get('branch/:branchId')
  @Roles(
    RoleEnum.admin,
    RoleEnum.staff,
    RoleEnum.teacher,
    RoleEnum.student,
    RoleEnum.parent,
  )
  @RequirePermissions('academic.timetable.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'branchId', type: String })
  @ApiOkResponse({ type: [Timetable] })
  findByBranch(@Param('branchId', ParseUUIDPipe) branchId: string) {
    return this.service.findByBranch(branchId);
  }

  @Get('conflicts')
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @RequirePermissions('academic.timetable.read')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'teacherId', type: String, required: true })
  @ApiQuery({ name: 'dayOfWeek', type: Number, required: true })
  @ApiQuery({ name: 'startTime', type: String, required: true })
  @ApiQuery({ name: 'endTime', type: String, required: true })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
  @ApiOkResponse({ type: [Period] })
  checkConflicts(
    @Query('teacherId') teacherId: string,
    @Query('dayOfWeek') dayOfWeek: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.service.checkConflicts(
      teacherId,
      parseInt(dayOfWeek, 10),
      startTime,
      endTime,
    );
  }

  @Get(':id')
  @Roles(
    RoleEnum.admin,
    RoleEnum.staff,
    RoleEnum.teacher,
    RoleEnum.student,
    RoleEnum.parent,
  )
  @RequirePermissions('academic.timetable.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: Timetable })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @RequirePermissions('academic.timetable.update')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: Timetable })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTimetableDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @RequirePermissions('academic.timetable.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  // ─── Period Management ────────────────────────────────

  @Post(':id/periods')
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @RequirePermissions('academic.timetable.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiParam({ name: 'id', type: String, description: 'Timetable ID' })
  @ApiCreatedResponse({ type: Period })
  addPeriod(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AddPeriodDto) {
    dto.timetableId = id;
    return this.service.addPeriod(dto);
  }

  @Get(':id/periods')
  @Roles(
    RoleEnum.admin,
    RoleEnum.staff,
    RoleEnum.teacher,
    RoleEnum.student,
    RoleEnum.parent,
  )
  @RequirePermissions('academic.timetable.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String, description: 'Timetable ID' })
  @ApiOkResponse({ type: [Period] })
  findPeriods(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findPeriodsByTimetable(id);
  }

  @Delete('periods/:periodId')
  @Roles(RoleEnum.admin)
  @RequirePermissions('academic.timetable.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'periodId', type: String })
  removePeriod(@Param('periodId', ParseUUIDPipe) periodId: string) {
    return this.service.removePeriod(periodId);
  }
}
