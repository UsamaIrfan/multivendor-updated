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
  UseGuards,
  ParseUUIDPipe,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { RoleEnum } from '../roles/roles.enum';
import { NoticesService } from './notices.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { Notice } from './domain/notice';

@ApiTags('Notices')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'notices', version: '1' })
export class NoticesController {
  constructor(private readonly service: NoticesService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: Notice })
  create(@Body() dto: CreateNoticeDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(
    RoleEnum.admin,
    RoleEnum.staff,
    RoleEnum.teacher,
    RoleEnum.student,
    RoleEnum.parent,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [Notice] })
  findAll() {
    return this.service.findAll();
  }

  @Get('my-notices')
  @Roles(
    RoleEnum.admin,
    RoleEnum.staff,
    RoleEnum.teacher,
    RoleEnum.student,
    RoleEnum.parent,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [Notice] })
  @ApiQuery({
    name: 'branches',
    required: false,
    type: String,
    description: 'Comma-separated branch UUIDs the user belongs to',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  getMyNotices(@Request() req: any, @Query('branches') branches?: string) {
    const userBranches = branches ? branches.split(',').filter(Boolean) : [];
    const roleId = req.user?.role?.id;
    const roleMap: Record<number, string> = {
      [RoleEnum.admin]: 'admin',
      [RoleEnum.user]: 'user',
      [RoleEnum.student]: 'student',
      [RoleEnum.teacher]: 'teacher',
      [RoleEnum.staff]: 'staff',
      [RoleEnum.accountant]: 'accountant',
      [RoleEnum.parent]: 'parent',
    };
    const userRole = roleMap[roleId] || 'user';
    return this.service.findMyNotices(userBranches, userRole);
  }

  @Get('branch/:branchId')
  @Roles(
    RoleEnum.admin,
    RoleEnum.staff,
    RoleEnum.teacher,
    RoleEnum.student,
    RoleEnum.parent,
  )
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'branchId', type: String })
  @ApiOkResponse({ type: [Notice] })
  findByBranch(@Param('branchId', ParseUUIDPipe) branchId: string) {
    return this.service.findByBranch(branchId);
  }

  @Get(':id')
  @Roles(
    RoleEnum.admin,
    RoleEnum.staff,
    RoleEnum.teacher,
    RoleEnum.student,
    RoleEnum.parent,
  )
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: Notice })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: Notice })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateNoticeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
