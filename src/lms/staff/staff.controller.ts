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
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { StaffService } from './staff.service';

import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { CreateStaffAttendanceDto } from './dto/create-staff-attendance.dto';
import { UpdateStaffAttendanceDto } from './dto/update-staff-attendance.dto';
import { CreateStaffLeaveDto } from './dto/create-staff-leave.dto';
import { UpdateStaffLeaveDto } from './dto/update-staff-leave.dto';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { CreateTimetableSlotDto } from './dto/create-timetable-slot.dto';
import { UpdateTimetableSlotDto } from './dto/update-timetable-slot.dto';
import { CreateSalarySlipDto } from './dto/create-salary-slip.dto';
import { UpdateSalarySlipDto } from './dto/update-salary-slip.dto';

// ═══════════════════════════════════════════════════════════
//  Staff
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Staff')
@Controller({ path: 'lms/staff', version: '1' })
export class StaffController {
  constructor(private readonly service: StaffService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Staff created' })
  create(@Body() dto: CreateStaffDto) {
    return this.service.createStaff(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all staff' })
  findAll() {
    return this.service.findAllStaff();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneStaff(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStaffDto) {
    return this.service.updateStaff(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeStaff(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Staff Attendance
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Staff Attendance')
@Controller({ path: 'lms/staff-attendance', version: '1' })
export class StaffAttendanceController {
  constructor(private readonly service: StaffService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Staff attendance created' })
  create(@Body() dto: CreateStaffAttendanceDto) {
    return this.service.createStaffAttendance(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all staff attendance records' })
  findAll() {
    return this.service.findAllStaffAttendances();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneStaffAttendance(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffAttendanceDto,
  ) {
    return this.service.updateStaffAttendance(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeStaffAttendance(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Staff Leaves
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Staff Leaves')
@Controller({ path: 'lms/staff-leaves', version: '1' })
export class StaffLeaveController {
  constructor(private readonly service: StaffService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Staff leave created' })
  create(@Body() dto: CreateStaffLeaveDto) {
    return this.service.createStaffLeave(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all staff leaves' })
  findAll() {
    return this.service.findAllStaffLeaves();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneStaffLeave(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffLeaveDto,
  ) {
    return this.service.updateStaffLeave(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeStaffLeave(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Notices
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Notices')
@Controller({ path: 'lms/notices', version: '1' })
export class NoticeController {
  constructor(private readonly service: StaffService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Notice created' })
  create(@Body() dto: CreateNoticeDto) {
    return this.service.createNotice(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all notices' })
  findAll() {
    return this.service.findAllNotices();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneNotice(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNoticeDto) {
    return this.service.updateNotice(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeNotice(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Timetable Slots
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Timetable Slots')
@Controller({ path: 'lms/timetable-slots', version: '1' })
export class TimetableSlotController {
  constructor(private readonly service: StaffService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Timetable slot created' })
  create(@Body() dto: CreateTimetableSlotDto) {
    return this.service.createTimetableSlot(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all timetable slots' })
  findAll() {
    return this.service.findAllTimetableSlots();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneTimetableSlot(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTimetableSlotDto,
  ) {
    return this.service.updateTimetableSlot(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeTimetableSlot(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Salary Slips
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Salary Slips')
@Controller({ path: 'lms/salary-slips', version: '1' })
export class SalarySlipController {
  constructor(private readonly service: StaffService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Salary slip created' })
  create(@Body() dto: CreateSalarySlipDto) {
    return this.service.createSalarySlip(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all salary slips' })
  findAll() {
    return this.service.findAllSalarySlips();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneSalarySlip(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSalarySlipDto,
  ) {
    return this.service.updateSalarySlip(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeSalarySlip(id);
  }
}
