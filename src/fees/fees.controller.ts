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
import { FeesService } from './fees.service';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import {
  GenerateChallanDto,
  GenerateBulkChallanDto,
} from './dto/generate-challan.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { ApplyConcessionDto } from './dto/apply-concession.dto';
import {
  SendRemindersDto,
  CollectionReportQueryDto,
} from './dto/fee-query.dto';

@ApiTags('Fee Management')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard, RequireTenantGuard)
@Controller({ path: 'fees', version: '1' })
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  // ════════════ FEE STRUCTURES ════════════

  @Post('structures')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @RequirePermissions('finance.fee_structure.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Fee structure created' })
  createStructure(@Body() dto: CreateFeeStructureDto) {
    return this.feesService.createFeeStructure(dto);
  }

  @Get('structures/:id')
  @Roles(RoleEnum.admin, RoleEnum.accountant, RoleEnum.staff)
  @RequirePermissions('finance.fee_structure.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Fee structure details' })
  getStructure(@Param('id', ParseIntPipe) id: number) {
    return this.feesService.getFeeStructure(id);
  }

  // ════════════ CHALLAN GENERATION ════════════

  @Post('challans/generate')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @RequirePermissions('finance.challan.generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Challan generated' })
  generateChallan(@Body() dto: GenerateChallanDto) {
    return this.feesService.generateChallan(dto);
  }

  @Post('challans/generate-bulk')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @RequirePermissions('finance.challan.bulk_generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Bulk challans generated' })
  generateBulkChallans(@Body() dto: GenerateBulkChallanDto) {
    return this.feesService.generateBulkChallans(dto);
  }

  @Get('challans/:challanNumber')
  @Roles(
    RoleEnum.admin,
    RoleEnum.accountant,
    RoleEnum.staff,
    RoleEnum.student,
    RoleEnum.parent,
  )
  @RequirePermissions('finance.challan.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'challanNumber', type: String })
  @ApiOkResponse({ description: 'Challan details' })
  getChallan(@Param('challanNumber') challanNumber: string) {
    return this.feesService.getChallanByNumber(challanNumber);
  }

  // ════════════ PAYMENTS ════════════

  @Post('payments')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @RequirePermissions('finance.payment.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Payment recorded' })
  recordPayment(@Body() dto: RecordPaymentDto) {
    return this.feesService.recordPayment(dto);
  }

  @Patch('payments/:id/verify')
  @Roles(RoleEnum.admin)
  @RequirePermissions('finance.payment.verify')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Payment verified' })
  verifyPayment(@Param('id', ParseIntPipe) id: number) {
    return this.feesService.verifyPayment(id);
  }

  // ════════════ CONCESSIONS ════════════

  @Post('concessions')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @RequirePermissions('finance.concession.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Concession applied' })
  applyConcession(@Body() dto: ApplyConcessionDto) {
    return this.feesService.applyConcession(dto);
  }

  @Get('students/:id/effective-concession')
  @Roles(RoleEnum.admin, RoleEnum.accountant, RoleEnum.student, RoleEnum.parent)
  @RequirePermissions('finance.concession.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Effective concession for student' })
  getEffectiveConcession(@Param('id', ParseIntPipe) id: number) {
    return this.feesService.getEffectiveConcession(id);
  }

  // ════════════ RECEIPTS ════════════

  @Get('receipts/:id/pdf')
  @Roles(RoleEnum.admin, RoleEnum.accountant, RoleEnum.student, RoleEnum.parent)
  @RequirePermissions('finance.receipt.pdf')
  @ApiParam({ name: 'id', type: Number })
  async getReceiptPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const pdf = await this.feesService.getReceiptPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=receipt-${id}.pdf`,
      'Content-Length': pdf.length,
    });
    res.send(pdf);
  }

  // ════════════ REPORTS ════════════

  @Get('reports/collection')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @RequirePermissions('finance.report.collection')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Collection report' })
  getCollectionReport(@Query() query: CollectionReportQueryDto) {
    return this.feesService.getCollectionReport(query);
  }

  @Get('reports/pending')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @RequirePermissions('finance.report.pending')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Pending fees report' })
  getPendingReport() {
    return this.feesService.getPendingReport();
  }

  @Get('reports/defaulters')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @RequirePermissions('finance.report.defaulters')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Defaulters list' })
  getDefaultersReport() {
    return this.feesService.getDefaultersReport();
  }

  // ════════════ REMINDERS ════════════

  @Post('send-reminders')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @RequirePermissions('finance.reminder.send')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Reminders sent' })
  sendReminders(@Body() dto: SendRemindersDto) {
    return this.feesService.sendPaymentReminders(dto);
  }

  // ════════════ STUDENT PORTAL ════════════

  @Get('my-challans')
  @Roles(RoleEnum.student, RoleEnum.parent, RoleEnum.user)
  @RequirePermissions('portal.my_fees.read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Own challans with payment history' })
  getMyChallans(@Request() req: any) {
    // Extract student ID from JWT claims
    const userId = req.user?.id;
    return this.feesService.getStudentChallans(userId);
  }
}
