import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { RoleEnum } from '../roles/roles.enum';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { CourseMaterial } from './domain/course-material';
import { Assignment } from './domain/assignment';
import { AssignmentSubmission } from './domain/assignment-submission';
import { StorageQuotaDto } from './dto/storage-quota.dto';

// ═══════════════════════════════════════════════════════════
//  Course Materials
// ═══════════════════════════════════════════════════════════
@ApiTags('Materials - Course Materials')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'materials', version: '1' })
export class MaterialsController {
  constructor(private readonly service: MaterialsService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.teacher, RoleEnum.staff)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: CourseMaterial })
  create(@Body() dto: CreateMaterialDto) {
    return this.service.uploadMaterial(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.teacher, RoleEnum.staff, RoleEnum.student)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [CourseMaterial] })
  findAll(@Query() query: QueryMaterialDto) {
    return this.service.listMaterials(query);
  }

  @Get('quota')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: StorageQuotaDto })
  getQuota() {
    return this.service.getStorageQuota();
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.teacher, RoleEnum.staff, RoleEnum.student)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: CourseMaterial })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneMaterial(id);
  }

  @Get(':id/download')
  @Roles(RoleEnum.admin, RoleEnum.teacher, RoleEnum.staff, RoleEnum.student)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: CourseMaterial })
  download(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user?.id ?? 0;
    return this.service.trackDownload(id, userId);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.teacher)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: CourseMaterial })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMaterialDto,
  ) {
    return this.service.updateMaterial(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeMaterial(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Assignments
// ═══════════════════════════════════════════════════════════
@ApiTags('Materials - Assignments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'materials/assignments', version: '1' })
export class AssignmentsController {
  constructor(private readonly service: MaterialsService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.teacher)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: Assignment })
  create(@Body() dto: CreateAssignmentDto) {
    return this.service.createAssignment(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.teacher, RoleEnum.staff, RoleEnum.student)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [Assignment] })
  findAll() {
    return this.service.findAllAssignments();
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.teacher, RoleEnum.staff, RoleEnum.student)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Assignment })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneAssignment(id);
  }

  @Post(':id/submit')
  @Roles(RoleEnum.admin, RoleEnum.student)
  @HttpCode(HttpStatus.CREATED)
  @ApiParam({ name: 'id', type: Number })
  @ApiCreatedResponse({ type: AssignmentSubmission })
  submit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SubmitAssignmentDto,
  ) {
    return this.service.submitAssignment(id, dto);
  }

  @Get(':id/submissions')
  @Roles(RoleEnum.admin, RoleEnum.teacher)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: [AssignmentSubmission] })
  getSubmissions(@Param('id', ParseIntPipe) id: number) {
    return this.service.findSubmissionsByAssignment(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.teacher)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Assignment })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.service.updateAssignment(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeAssignment(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Submissions (direct access)
// ═══════════════════════════════════════════════════════════
@ApiTags('Materials - Submissions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'materials/submissions', version: '1' })
export class SubmissionsController {
  constructor(private readonly service: MaterialsService) {}

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.teacher, RoleEnum.student)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: AssignmentSubmission })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneSubmission(id);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeSubmission(id);
  }
}
