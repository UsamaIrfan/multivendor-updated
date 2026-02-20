import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { RoleEnum } from '../roles/roles.enum';
import { StudentRegistrationService } from './student-registration.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { UpdateRegisteredStudentDto } from './dto/update-registered-student.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { UploadStudentDocumentDto } from './dto/upload-student-document.dto';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { QueryStudentDto } from './dto/query-student.dto';
import { StudentOwnershipGuard } from './guards/student-ownership.guard';
import { UnprocessableEntityException } from '@nestjs/common';

@ApiTags('Student Registration')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'student-registration', version: '1' })
export class StudentRegistrationController {
  constructor(private readonly service: StudentRegistrationService) {}

  // ─── Register new student ─────────────────────────────
  @Post()
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Student registered successfully' })
  register(@Body() dto: RegisterStudentDto) {
    return this.service.register(dto);
  }

  // ─── List students (paginated + filters) ──────────────
  @Get()
  @Roles(RoleEnum.admin, RoleEnum.teacher, RoleEnum.staff)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Paginated list of students' })
  findAll(@Query() query: QueryStudentDto) {
    return this.service.findAll(query);
  }

  // ─── Get single student ──────────────────────────────
  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.teacher, RoleEnum.staff, RoleEnum.student)
  @UseGuards(StudentOwnershipGuard)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Student details with relations' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // ─── Update student profile ───────────────────────────
  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.student)
  @UseGuards(StudentOwnershipGuard)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Student updated' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRegisteredStudentDto,
  ) {
    return this.service.update(id, dto);
  }

  // ─── Delete student ───────────────────────────────────
  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // ─── Upload document for student ──────────────────────
  @Post(':id/documents')
  @Roles(RoleEnum.admin, RoleEnum.student)
  @UseGuards(StudentOwnershipGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiParam({ name: 'id', type: Number })
  @ApiCreatedResponse({ description: 'Document uploaded for student' })
  uploadDocument(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UploadStudentDocumentDto,
  ) {
    return this.service.uploadDocument(id, dto);
  }

  // ─── Enroll student in class ──────────────────────────
  @Post(':id/enroll')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiParam({ name: 'id', type: Number })
  @ApiCreatedResponse({ description: 'Student enrolled in class' })
  enroll(@Param('id', ParseIntPipe) id: number, @Body() dto: EnrollStudentDto) {
    return this.service.enrollInClass(id, dto);
  }

  // ─── List documents for student ───────────────────────
  @Get(':id/documents')
  @Roles(RoleEnum.admin, RoleEnum.teacher, RoleEnum.staff, RoleEnum.student)
  @UseGuards(StudentOwnershipGuard)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'List of student documents' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  findDocuments(
    @Param('id', ParseIntPipe) id: number,
    @Query('documentType') documentType?: string,
  ) {
    return this.service.findDocuments(id, documentType);
  }

  // ─── Add guardian for student ─────────────────────────
  @Post(':id/guardians')
  @Roles(RoleEnum.admin, RoleEnum.student)
  @UseGuards(StudentOwnershipGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiParam({ name: 'id', type: Number })
  @ApiCreatedResponse({ description: 'Guardian added for student' })
  addGuardian(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateGuardianDto,
  ) {
    return this.service.addGuardian(id, dto);
  }

  // ─── List guardians for student ───────────────────────
  @Get(':id/guardians')
  @Roles(RoleEnum.admin, RoleEnum.teacher, RoleEnum.staff, RoleEnum.student)
  @UseGuards(StudentOwnershipGuard)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'List of student guardians' })
  findGuardians(@Param('id', ParseIntPipe) id: number) {
    return this.service.findGuardians(id);
  }

  // ─── Bulk import students from CSV ────────────────────
  @Post('import')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        institutionId: { type: 'number' },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Bulk import result' })
  async importStudents(
    @UploadedFile() file: Express.Multer.File,
    @Body('institutionId') institutionId: string,
  ) {
    if (!file) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: { file: 'File is required' },
      });
    }

    const instId = parseInt(institutionId, 10);
    if (isNaN(instId)) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: { institutionId: 'Valid institution ID is required' },
      });
    }

    return this.service.importStudents(file.buffer, instId, file.originalname);
  }
}
