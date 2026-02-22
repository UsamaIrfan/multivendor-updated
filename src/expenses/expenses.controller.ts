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
import { ExpensesService } from './expenses.service';
import { CreateBranchExpenseDto } from './dto/create-branch-expense.dto';
import { UpdateBranchExpenseDto } from './dto/update-branch-expense.dto';
import { ExpenseReportQueryDto } from './dto/expense-report-query.dto';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard, RequireTenantGuard)
@Controller({ path: 'expenses', version: '1' })
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @RequirePermissions('finance.expense.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Expense record created' })
  create(@Body() dto: CreateBranchExpenseDto) {
    return this.expensesService.create(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.accountant, RoleEnum.staff)
  @RequirePermissions('finance.expense.read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all expense records' })
  findAll() {
    return this.expensesService.findAll();
  }

  @Get('reports')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @RequirePermissions('finance.expense.read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Expense report with optional filtering' })
  getExpenseReport(@Query() query: ExpenseReportQueryDto) {
    return this.expensesService.getExpenseReport(query);
  }

  @Get('reports/consolidated')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @RequirePermissions('finance.expense.read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Consolidated report grouped by branch with totals',
  })
  getConsolidatedReport(@Query() query: ExpenseReportQueryDto) {
    return this.expensesService.getConsolidatedReport(query);
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.accountant, RoleEnum.staff)
  @RequirePermissions('finance.expense.read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Get expense record by ID' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.expensesService.findById(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @RequirePermissions('finance.expense.update')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Expense record updated' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBranchExpenseDto,
  ) {
    return this.expensesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @RequirePermissions('finance.expense.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.expensesService.remove(id);
  }
}
