import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { RequireTenantGuard } from '../tenant/guards/require-tenant.guard';
import { RequirePermissions } from '../authorization/decorators/require-permissions.decorator';
import { IncomeService } from './income.service';
import { CreateBranchIncomeDto } from './dto/create-branch-income.dto';
import { UpdateBranchIncomeDto } from './dto/update-branch-income.dto';
import { IncomeReportQueryDto } from './dto/income-report-query.dto';

@ApiTags('Income')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard, RequireTenantGuard)
@Controller({ path: 'income', version: '1' })
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @RequirePermissions('finance.income.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Income record created' })
  create(@Body() dto: CreateBranchIncomeDto) {
    return this.incomeService.create(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.accountant, RoleEnum.staff)
  @RequirePermissions('finance.income.read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all income records' })
  findAll() {
    return this.incomeService.findAll();
  }

  @Get('reports')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @RequirePermissions('finance.income.read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Income report with optional filtering' })
  getIncomeReport(@Query() query: IncomeReportQueryDto) {
    return this.incomeService.getIncomeReport(query);
  }

  @Get('reports/consolidated')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @RequirePermissions('finance.income.read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Consolidated report grouped by branch with totals',
  })
  getConsolidatedReport(@Query() query: IncomeReportQueryDto) {
    return this.incomeService.getConsolidatedReport(query);
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.accountant, RoleEnum.staff)
  @RequirePermissions('finance.income.read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Get income record by ID' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.incomeService.findById(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @RequirePermissions('finance.income.update')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Income record updated' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBranchIncomeDto,
  ) {
    return this.incomeService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @RequirePermissions('finance.income.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.incomeService.remove(id);
  }
}
