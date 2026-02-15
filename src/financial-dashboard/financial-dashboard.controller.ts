import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { FinancialDashboardService } from './financial-dashboard.service';
import { FinancialDashboardQueryDto } from './dto/financial-dashboard-query.dto';

@ApiTags('Financial Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'financial-dashboard', version: '1' })
export class FinancialDashboardController {
  constructor(private readonly dashboardService: FinancialDashboardService) {}

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description:
      'Tenant-wide financial dashboard with P&L and branch breakdown',
  })
  getDashboard(@Query() query: FinancialDashboardQueryDto) {
    return this.dashboardService.getFinancialDashboard(query);
  }

  @Get('profit-loss')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Branch-wise Profit & Loss (optionally filter by branch)',
  })
  getProfitLoss(@Query() query: FinancialDashboardQueryDto) {
    return this.dashboardService.getBranchProfitLoss(query);
  }

  @Get('balance-sheet')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Consolidated balance sheet across all branches',
  })
  getBalanceSheet(@Query() query: FinancialDashboardQueryDto) {
    return this.dashboardService.getConsolidatedBalanceSheet(query);
  }

  @Get('cash-flow')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Monthly cash flow per branch',
  })
  getCashFlow(@Query() query: FinancialDashboardQueryDto) {
    return this.dashboardService.getCashFlowByBranch(query);
  }
}
