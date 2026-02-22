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
  UseGuards,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { RoleEnum } from '../roles/roles.enum';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { RequireTenantGuard } from '../tenant/guards/require-tenant.guard';
import { RequirePermissions } from '../authorization/decorators/require-permissions.decorator';
import { PayrollService } from './payroll.service';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { UpdateSalaryStructureDto } from './dto/update-salary-structure.dto';
import { ProcessPayrollDto } from './dto/process-payroll.dto';
import { SalaryStructure } from './domain/salary-structure';
import { PayrollSlip } from './domain/payroll-slip';

// ═══════════════════════════════════════════════════════════
//  Salary Structures
// ═══════════════════════════════════════════════════════════
@ApiTags('Payroll - Salary Structures')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard, RequireTenantGuard)
@Controller({ path: 'payroll/structures', version: '1' })
export class SalaryStructureController {
  constructor(private readonly service: PayrollService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @RequirePermissions('hr.payroll.structure_create')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: SalaryStructure })
  create(@Body() dto: CreateSalaryStructureDto) {
    return this.service.createStructure(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.accountant, RoleEnum.staff)
  @RequirePermissions('hr.payroll.structure_read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [SalaryStructure] })
  findAll() {
    return this.service.findAllStructures();
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.accountant, RoleEnum.staff)
  @RequirePermissions('hr.payroll.structure_read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: SalaryStructure })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneStructure(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @RequirePermissions('hr.payroll.structure_update')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: SalaryStructure })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSalaryStructureDto,
  ) {
    return this.service.updateStructure(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @RequirePermissions('hr.payroll.structure_delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeStructure(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Payroll Processing & Slips
// ═══════════════════════════════════════════════════════════
@ApiTags('Payroll - Processing & Slips')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard, RequireTenantGuard)
@Controller({ path: 'payroll', version: '1' })
export class PayrollController {
  constructor(private readonly service: PayrollService) {}

  @Post('process')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @RequirePermissions('hr.payroll.process')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Payroll processed' })
  process(@Body() dto: ProcessPayrollDto) {
    return this.service.processPayroll(dto);
  }

  @Get('slips')
  @Roles(RoleEnum.admin, RoleEnum.accountant, RoleEnum.staff)
  @RequirePermissions('hr.payroll.slip_read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [PayrollSlip] })
  findAllSlips() {
    return this.service.findAllSlips();
  }

  @Get('slips/:id')
  @Roles(RoleEnum.admin, RoleEnum.accountant, RoleEnum.staff)
  @RequirePermissions('hr.payroll.slip_read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: PayrollSlip })
  findOneSlip(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneSlip(id);
  }

  @Get('slips/:id/pdf')
  @Roles(RoleEnum.admin, RoleEnum.accountant, RoleEnum.staff)
  @RequirePermissions('hr.payroll.slip_pdf')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiProduces('application/pdf')
  @ApiOkResponse({ description: 'PDF salary slip with tenant branding' })
  async generatePdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.service.generatePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="salary-slip-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
