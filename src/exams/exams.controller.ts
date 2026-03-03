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
  Res,
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
import { Response } from 'express';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { RoleEnum } from '../roles/roles.enum';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { RequireTenantGuard } from '../tenant/guards/require-tenant.guard';
import { RequirePermissions } from '../authorization/decorators/require-permissions.decorator';
import { ExamsService } from './exams.service';
import { ReportCardService } from './report-card.service';
import { CreateGradingScaleDto } from './dto/create-grading-scale.dto';
import { CreateExamScheduleDto } from './dto/create-exam-schedule.dto';
import { EnterMarksDto } from './dto/enter-marks.dto';
import { BulkMarksImportDto } from './dto/bulk-marks-import.dto';
import { PublishResultsDto } from './dto/publish-results.dto';
import { UpdateExamStatusDto } from './dto/update-exam-status.dto';

@ApiTags('Examination & Results')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard, RequireTenantGuard)
@Controller({ path: 'exams', version: '1' })
export class ExamsController {
  constructor(
    private readonly examsService: ExamsService,
    private readonly reportCardService: ReportCardService,
  ) {}

  // ════════════ GRADING SCALES ════════════

  @Post('grading-scales')
  @Roles(RoleEnum.admin)
  @RequirePermissions('academic.grading_scale.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Grading scale created' })
  createGradingScale(@Body() dto: CreateGradingScaleDto) {
    return this.examsService.createGradingScale(dto);
  }

  @Get('grading-scales')
  @Roles(RoleEnum.admin, RoleEnum.teacher, RoleEnum.staff)
  @RequirePermissions('academic.grading_scale.read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List of grading scales' })
  listGradingScales() {
    return this.examsService.getAllGradingScales();
  }

  @Get('grading-scales/:id')
  @Roles(RoleEnum.admin, RoleEnum.teacher, RoleEnum.staff)
  @RequirePermissions('academic.grading_scale.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Grading scale details' })
  getGradingScale(@Param('id', ParseIntPipe) id: number) {
    return this.examsService.getGradingScale(id);
  }

  // ════════════ EXAM SCHEDULES ════════════

  @Post('schedules')
  @Roles(RoleEnum.admin, RoleEnum.teacher)
  @RequirePermissions('academic.exam.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Exam schedule created' })
  createSchedule(@Body() dto: CreateExamScheduleDto) {
    return this.examsService.createExamSchedule(dto);
  }

  @Get('schedules/:id')
  @Roles(RoleEnum.admin, RoleEnum.teacher, RoleEnum.staff, RoleEnum.student)
  @RequirePermissions('academic.exam.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Exam schedule details' })
  getSchedule(@Param('id', ParseIntPipe) id: number) {
    return this.examsService.getExamSchedule(id);
  }

  @Patch('schedules/:id/status')
  @Roles(RoleEnum.admin)
  @RequirePermissions('academic.exam.update')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Exam status updated' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamStatusDto,
  ) {
    return this.examsService.updateExamStatus(id, dto.status);
  }

  // ════════════ MARKS ENTRY ════════════

  @Post('marks')
  @Roles(RoleEnum.admin, RoleEnum.teacher)
  @RequirePermissions('academic.marks.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Marks entered' })
  enterMarks(@Body() dto: EnterMarksDto) {
    return this.examsService.enterMarks(dto);
  }

  @Post('marks/bulk')
  @Roles(RoleEnum.admin, RoleEnum.teacher)
  @RequirePermissions('academic.marks.bulk_import')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Marks imported in bulk' })
  bulkImportMarks(@Body() dto: BulkMarksImportDto) {
    return this.examsService.bulkImportMarks(dto);
  }

  @Get('marks/:examSubjectId')
  @Roles(RoleEnum.admin, RoleEnum.teacher, RoleEnum.staff)
  @RequirePermissions('academic.marks.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'examSubjectId', type: Number })
  @ApiOkResponse({ description: 'Marks for exam subject' })
  getMarks(@Param('examSubjectId', ParseIntPipe) examSubjectId: number) {
    return this.examsService.getMarksForExamSubject(examSubjectId);
  }

  // ════════════ RESULT PUBLICATION ════════════

  @Patch(':examId/publish')
  @Roles(RoleEnum.admin)
  @RequirePermissions('academic.exam.publish')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'examId', type: Number })
  @ApiOkResponse({ description: 'Results published' })
  publishResults(
    @Param('examId', ParseIntPipe) examId: number,
    @Body() dto: PublishResultsDto,
  ) {
    return this.examsService.publishResults({
      examId,
      gradingScaleId: dto.gradingScaleId,
    });
  }

  // ════════════ STUDENT RESULTS ════════════

  @Get('results/student/:studentId')
  @Roles(
    RoleEnum.admin,
    RoleEnum.teacher,
    RoleEnum.staff,
    RoleEnum.student,
    RoleEnum.parent,
  )
  @RequirePermissions('academic.marks.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'studentId', type: Number })
  @ApiOkResponse({ description: 'All results for a student' })
  getStudentResults(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.examsService.getStudentResults(studentId);
  }

  @Get('results/student/:studentId/exam/:examId')
  @Roles(
    RoleEnum.admin,
    RoleEnum.teacher,
    RoleEnum.staff,
    RoleEnum.student,
    RoleEnum.parent,
  )
  @RequirePermissions('academic.marks.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'studentId', type: Number })
  @ApiParam({ name: 'examId', type: Number })
  @ApiOkResponse({ description: 'Student exam result details' })
  getStudentExamResult(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('examId', ParseIntPipe) examId: number,
  ) {
    return this.examsService.getStudentExamResult(studentId, examId);
  }

  @Get('results/student/:studentId/exam/:examId/report-card')
  @Roles(
    RoleEnum.admin,
    RoleEnum.teacher,
    RoleEnum.staff,
    RoleEnum.student,
    RoleEnum.parent,
  )
  @RequirePermissions('academic.report_card.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'studentId', type: Number })
  @ApiParam({ name: 'examId', type: Number })
  @ApiOkResponse({ description: 'PDF report card' })
  async getReportCard(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('examId', ParseIntPipe) examId: number,
    @Res() res: Response,
  ) {
    const result = await this.examsService.getStudentExamResult(
      studentId,
      examId,
    );

    const pdfBuffer = await this.reportCardService.generatePdf({
      studentName: result.student.name ?? `Student #${studentId}`,
      examName: result.exam.name,
      subjects: result.subjects.map((s: any) => ({
        subjectName: s.subjectName ?? `Subject #${s.subjectId}`,
        totalMarks: s.totalMarks,
        marksObtained: s.marksObtained,
        grade: s.grade,
        isAbsent: s.isAbsent,
        passed: s.passed,
      })),
      totalMarks: result.totalMarks,
      obtainedMarks: result.obtainedMarks,
      percentage: result.percentage,
      overallGrade: result.overallGrade,
      rank: result.rank,
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="report-card-${studentId}-${examId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  // ════════════ ANALYTICS ════════════

  @Get('analytics/exam/:examId')
  @Roles(RoleEnum.admin, RoleEnum.teacher, RoleEnum.staff)
  @RequirePermissions('academic.analytics.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'examId', type: Number })
  @ApiOkResponse({ description: 'Exam analytics' })
  getExamAnalytics(@Param('examId', ParseIntPipe) examId: number) {
    return this.examsService.getExamAnalytics(examId);
  }

  @Get('analytics/subject/:examSubjectId')
  @Roles(RoleEnum.admin, RoleEnum.teacher, RoleEnum.staff)
  @RequirePermissions('academic.analytics.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'examSubjectId', type: Number })
  @ApiOkResponse({ description: 'Subject analytics' })
  getSubjectAnalytics(
    @Param('examSubjectId', ParseIntPipe) examSubjectId: number,
  ) {
    return this.examsService.getSubjectAnalytics(examSubjectId);
  }
}
