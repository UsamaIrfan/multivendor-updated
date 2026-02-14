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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../roles/roles.decorator';
import { RolesGuard } from '../../roles/roles.guard';
import { RoleEnum } from '../../roles/roles.enum';
import { AccountsService } from './accounts.service';

import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

// ═══════════════════════════════════════════════════════════
//  Income
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Income')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'lms/income', version: '1' })
export class IncomeController {
  constructor(private readonly service: AccountsService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Income created' })
  create(@Body() dto: CreateIncomeDto) {
    return this.service.createIncome(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all income records' })
  findAll() {
    return this.service.findAllIncomes();
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneIncome(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIncomeDto) {
    return this.service.updateIncome(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeIncome(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Expenses
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Expenses')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'lms/expenses', version: '1' })
export class ExpenseController {
  constructor(private readonly service: AccountsService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Expense created' })
  create(@Body() dto: CreateExpenseDto) {
    return this.service.createExpense(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all expenses' })
  findAll() {
    return this.service.findAllExpenses();
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneExpense(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExpenseDto) {
    return this.service.updateExpense(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeExpense(id);
  }
}
