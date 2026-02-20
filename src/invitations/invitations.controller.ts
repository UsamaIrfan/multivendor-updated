import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
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
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { VerifyInvitationDto } from './dto/verify-invitation.dto';
import { Invitation } from './domain/invitation';
import { LoginResponseDto } from '../auth/dto/login-response.dto';

@ApiTags('Invitations')
@Controller({ path: 'invitations', version: '1' })
export class InvitationsController {
  constructor(private readonly service: InvitationsService) {}

  // ─── Protected endpoints (admin only) ─────────────────

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'Invitation sent successfully',
    type: Invitation,
  })
  async send(
    @Request() request,
    @Body() dto: CreateInvitationDto,
  ): Promise<Invitation> {
    return this.service.sendInvitation(dto, request.user.id);
  }

  @Get('tenant/:tenantId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'List all invitations for a tenant',
    type: [Invitation],
  })
  findAll(@Param('tenantId') tenantId: string): Promise<Invitation[]> {
    return this.service.findAllByTenant(tenantId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancel(@Param('id') id: string): Promise<void> {
    return this.service.cancelInvitation(id);
  }

  @Post(':id/resend')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async resend(
    @Request() request,
    @Param('id') id: string,
  ): Promise<void> {
    return this.service.resendInvitation(id, request.user.id);
  }

  // ─── Public endpoints (no auth needed) ────────────────

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Invitation details for the accept form' })
  verify(@Body() dto: VerifyInvitationDto) {
    return this.service.verifyInvitation(dto);
  }

  @Post('accept')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Invitation accepted, user logged in',
    type: LoginResponseDto,
  })
  accept(@Body() dto: AcceptInvitationDto): Promise<LoginResponseDto> {
    return this.service.acceptInvitation(dto);
  }
}
