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
import { PermissionsGuard } from '../../authorization/guards/permissions.guard';
import { RequireTenantGuard } from '../../tenant/guards/require-tenant.guard';
import { RequirePermissions } from '../../authorization/decorators/require-permissions.decorator';
import { AcademicService } from './academic.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';
import { AcademicYear } from './domain/academic-year';
import { Term } from './domain/term';

// ═══════════════════════════════════════════════════════════
//  Academic Years
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Academic Years')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard, RequireTenantGuard)
@Controller({ path: 'lms/academic-years', version: '1' })
export class AcademicYearController {
  constructor(private readonly service: AcademicService) {}

  @Post()
  @Roles(RoleEnum.admin)
  @RequirePermissions('academic.academic_year.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: AcademicYear })
  create(@Body() dto: CreateAcademicYearDto) {
    return this.service.createAcademicYear(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @RequirePermissions('academic.academic_year.read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [AcademicYear] })
  findAll() {
    return this.service.findAllAcademicYears();
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @RequirePermissions('academic.academic_year.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: AcademicYear })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneAcademicYear(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin)
  @RequirePermissions('academic.academic_year.update')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: AcademicYear })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAcademicYearDto,
  ) {
    return this.service.updateAcademicYear(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @RequirePermissions('academic.academic_year.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeAcademicYear(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Terms
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Terms')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard, RequireTenantGuard)
@Controller({ path: 'lms/terms', version: '1' })
export class TermController {
  constructor(private readonly service: AcademicService) {}

  @Post()
  @Roles(RoleEnum.admin)
  @RequirePermissions('academic.academic_term.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: Term })
  create(@Body() dto: CreateTermDto) {
    return this.service.createTerm(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @RequirePermissions('academic.academic_term.read')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [Term] })
  findAll() {
    return this.service.findAllTerms();
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @RequirePermissions('academic.academic_term.read')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Term })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneTerm(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin)
  @RequirePermissions('academic.academic_term.update')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Term })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTermDto) {
    return this.service.updateTerm(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @RequirePermissions('academic.academic_term.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeTerm(id);
  }
}
