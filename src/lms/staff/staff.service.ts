import { Injectable, NotFoundException } from '@nestjs/common';

import { StaffRepository } from './infrastructure/persistence/staff.repository';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

import { StaffAttendanceRepository } from './infrastructure/persistence/staff-attendance.repository';
import { CreateStaffAttendanceDto } from './dto/create-staff-attendance.dto';
import { UpdateStaffAttendanceDto } from './dto/update-staff-attendance.dto';

import { StaffLeaveRepository } from './infrastructure/persistence/staff-leave.repository';
import { CreateStaffLeaveDto } from './dto/create-staff-leave.dto';
import { UpdateStaffLeaveDto } from './dto/update-staff-leave.dto';

import { NoticeRepository } from './infrastructure/persistence/notice.repository';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

import { TimetableSlotRepository } from './infrastructure/persistence/timetable-slot.repository';
import { CreateTimetableSlotDto } from './dto/create-timetable-slot.dto';
import { UpdateTimetableSlotDto } from './dto/update-timetable-slot.dto';

import { SalarySlipRepository } from './infrastructure/persistence/salary-slip.repository';
import { CreateSalarySlipDto } from './dto/create-salary-slip.dto';
import { UpdateSalarySlipDto } from './dto/update-salary-slip.dto';

@Injectable()
export class StaffService {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly staffAttendanceRepository: StaffAttendanceRepository,
    private readonly staffLeaveRepository: StaffLeaveRepository,
    private readonly noticeRepository: NoticeRepository,
    private readonly timetableSlotRepository: TimetableSlotRepository,
    private readonly salarySlipRepository: SalarySlipRepository,
  ) {}

  // ─── Staff ────────────────────────────────────────────
  createStaff(dto: CreateStaffDto) {
    return this.staffRepository.create(dto);
  }

  findAllStaff() {
    return this.staffRepository.findAll();
  }

  async findOneStaff(id: number) {
    const staff = await this.staffRepository.findById(id);
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  async updateStaff(id: number, dto: UpdateStaffDto) {
    await this.findOneStaff(id);
    return this.staffRepository.update(id, dto);
  }

  async removeStaff(id: number) {
    await this.findOneStaff(id);
    return this.staffRepository.remove(id);
  }

  // ─── Staff Attendance ─────────────────────────────────
  createStaffAttendance(dto: CreateStaffAttendanceDto) {
    return this.staffAttendanceRepository.create(dto);
  }

  findAllStaffAttendances() {
    return this.staffAttendanceRepository.findAll();
  }

  async findOneStaffAttendance(id: number) {
    const attendance = await this.staffAttendanceRepository.findById(id);
    if (!attendance) throw new NotFoundException('Staff attendance not found');
    return attendance;
  }

  async updateStaffAttendance(id: number, dto: UpdateStaffAttendanceDto) {
    await this.findOneStaffAttendance(id);
    return this.staffAttendanceRepository.update(id, dto);
  }

  async removeStaffAttendance(id: number) {
    await this.findOneStaffAttendance(id);
    return this.staffAttendanceRepository.remove(id);
  }

  // ─── Staff Leave ──────────────────────────────────────
  createStaffLeave(dto: CreateStaffLeaveDto) {
    return this.staffLeaveRepository.create(dto);
  }

  findAllStaffLeaves() {
    return this.staffLeaveRepository.findAll();
  }

  async findOneStaffLeave(id: number) {
    const leave = await this.staffLeaveRepository.findById(id);
    if (!leave) throw new NotFoundException('Staff leave not found');
    return leave;
  }

  async updateStaffLeave(id: number, dto: UpdateStaffLeaveDto) {
    await this.findOneStaffLeave(id);
    return this.staffLeaveRepository.update(id, dto);
  }

  async removeStaffLeave(id: number) {
    await this.findOneStaffLeave(id);
    return this.staffLeaveRepository.remove(id);
  }

  // ─── Notice ───────────────────────────────────────────
  createNotice(dto: CreateNoticeDto) {
    return this.noticeRepository.create(dto);
  }

  findAllNotices() {
    return this.noticeRepository.findAll();
  }

  async findOneNotice(id: number) {
    const notice = await this.noticeRepository.findById(id);
    if (!notice) throw new NotFoundException('Notice not found');
    return notice;
  }

  async updateNotice(id: number, dto: UpdateNoticeDto) {
    await this.findOneNotice(id);
    return this.noticeRepository.update(id, dto);
  }

  async removeNotice(id: number) {
    await this.findOneNotice(id);
    return this.noticeRepository.remove(id);
  }

  // ─── Timetable Slot ──────────────────────────────────
  createTimetableSlot(dto: CreateTimetableSlotDto) {
    return this.timetableSlotRepository.create(dto);
  }

  findAllTimetableSlots() {
    return this.timetableSlotRepository.findAll();
  }

  async findOneTimetableSlot(id: number) {
    const slot = await this.timetableSlotRepository.findById(id);
    if (!slot) throw new NotFoundException('Timetable slot not found');
    return slot;
  }

  async updateTimetableSlot(id: number, dto: UpdateTimetableSlotDto) {
    await this.findOneTimetableSlot(id);
    return this.timetableSlotRepository.update(id, dto);
  }

  async removeTimetableSlot(id: number) {
    await this.findOneTimetableSlot(id);
    return this.timetableSlotRepository.remove(id);
  }

  // ─── Salary Slip ─────────────────────────────────────
  createSalarySlip(dto: CreateSalarySlipDto) {
    return this.salarySlipRepository.create(dto);
  }

  findAllSalarySlips() {
    return this.salarySlipRepository.findAll();
  }

  async findOneSalarySlip(id: number) {
    const slip = await this.salarySlipRepository.findById(id);
    if (!slip) throw new NotFoundException('Salary slip not found');
    return slip;
  }

  async updateSalarySlip(id: number, dto: UpdateSalarySlipDto) {
    await this.findOneSalarySlip(id);
    return this.salarySlipRepository.update(id, dto);
  }

  async removeSalarySlip(id: number) {
    await this.findOneSalarySlip(id);
    return this.salarySlipRepository.remove(id);
  }
}
