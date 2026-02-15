import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { RoleEnum } from '../roles/roles.enum';
import { PortalsService } from './portals.service';
import { SwitchBranchDto } from './dto/switch-branch.dto';
import { StudentDashboard, StaffDashboard } from './domain/dashboard';

@ApiTags('Portals')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'portals', version: '1' })
export class PortalsController {
  constructor(private readonly service: PortalsService) {}

  @Get('student/dashboard')
  @Roles(RoleEnum.admin, RoleEnum.student, RoleEnum.parent)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: StudentDashboard })
  @ApiQuery({
    name: 'branchId',
    required: false,
    type: String,
    description: 'Filter by specific branch',
  })
  getStudentDashboard(
    @Request() req: any,
    @Query('branchId') branchId?: string,
  ) {
    return this.service.getStudentDashboard(req.user.id, branchId);
  }

  @Get('staff/dashboard')
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher, RoleEnum.accountant)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: StaffDashboard })
  @ApiQuery({
    name: 'branchId',
    required: false,
    type: String,
    description: 'Filter data by specific branch',
  })
  getStaffDashboard(@Request() req: any, @Query('branchId') branchId?: string) {
    return this.service.getStaffDashboard(req.user.id, branchId);
  }

  @Post('switch-branch')
  @Roles(
    RoleEnum.admin,
    RoleEnum.staff,
    RoleEnum.teacher,
    RoleEnum.accountant,
    RoleEnum.student,
    RoleEnum.parent,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Returns new branch context',
    schema: {
      properties: {
        branchId: { type: 'string' },
        branchName: { type: 'string' },
      },
    },
  })
  switchBranch(@Request() req: any, @Body() dto: SwitchBranchDto) {
    const tenantId = req.user.tenantId;
    return this.service.switchBranch(req.user.id, tenantId, dto.branchId);
  }
}
