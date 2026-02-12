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
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CreateGradeClassDto } from './dto/create-grade-class.dto';
import { UpdateGradeClassDto } from './dto/update-grade-class.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Institution } from './domain/institution';
import { Department } from './domain/department';
import { GradeClass } from './domain/grade-class';
import { Section } from './domain/section';
import { Subject } from './domain/subject';

// ═══════════════════════════════════════════════════════════
//  Institution
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Institutions')
@Controller({ path: 'lms/institutions', version: '1' })
export class InstitutionController {
  constructor(private readonly service: CoursesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: Institution })
  create(@Body() dto: CreateInstitutionDto) {
    return this.service.createInstitution(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [Institution] })
  findAll() {
    return this.service.findAllInstitutions();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Institution })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneInstitution(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Institution })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInstitutionDto,
  ) {
    return this.service.updateInstitution(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeInstitution(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Departments
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Departments')
@Controller({ path: 'lms/departments', version: '1' })
export class DepartmentController {
  constructor(private readonly service: CoursesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: Department })
  create(@Body() dto: CreateDepartmentDto) {
    return this.service.createDepartment(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [Department] })
  findAll() {
    return this.service.findAllDepartments();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Department })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneDepartment(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Department })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.service.updateDepartment(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeDepartment(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Grade Classes
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Grade Classes')
@Controller({ path: 'lms/grade-classes', version: '1' })
export class GradeClassController {
  constructor(private readonly service: CoursesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: GradeClass })
  create(@Body() dto: CreateGradeClassDto) {
    return this.service.createGradeClass(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [GradeClass] })
  findAll() {
    return this.service.findAllGradeClasses();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: GradeClass })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneGradeClass(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: GradeClass })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGradeClassDto,
  ) {
    return this.service.updateGradeClass(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeGradeClass(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Sections
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Sections')
@Controller({ path: 'lms/sections', version: '1' })
export class SectionController {
  constructor(private readonly service: CoursesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: Section })
  create(@Body() dto: CreateSectionDto) {
    return this.service.createSection(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [Section] })
  findAll() {
    return this.service.findAllSections();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Section })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneSection(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Section })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSectionDto) {
    return this.service.updateSection(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeSection(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Subjects
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Subjects')
@Controller({ path: 'lms/subjects', version: '1' })
export class SubjectController {
  constructor(private readonly service: CoursesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: Subject })
  create(@Body() dto: CreateSubjectDto) {
    return this.service.createSubject(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [Subject] })
  findAll() {
    return this.service.findAllSubjects();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Subject })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneSubject(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Subject })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSubjectDto) {
    return this.service.updateSubject(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeSubject(id);
  }
}
