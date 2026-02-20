import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InvitationRepository } from './infrastructure/persistence/invitation.repository';
import { Invitation, InvitationStatusEnum } from './domain/invitation';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { VerifyInvitationDto } from './dto/verify-invitation.dto';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { TenantService } from '../tenant/tenant.service';
import { AllConfigType } from '../config/config.type';
import { RoleEnum } from '../roles/roles.enum';
import { StatusEnum } from '../statuses/statuses.enum';
import { LoginResponseDto } from '../auth/dto/login-response.dto';
import { SessionService } from '../session/session.service';
import ms from 'ms';
import crypto from 'crypto';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

const ROLE_NAMES: Record<number, string> = {
  [RoleEnum.admin]: 'Admin',
  [RoleEnum.user]: 'User',
  [RoleEnum.student]: 'Student',
  [RoleEnum.teacher]: 'Teacher',
  [RoleEnum.staff]: 'Staff',
  [RoleEnum.accountant]: 'Accountant',
  [RoleEnum.parent]: 'Parent',
};

interface InvitationJwtPayload {
  invitationId: string;
  email: string;
  tenantId: string;
  branchId: string | null;
  roleId: number;
}

@Injectable()
export class InvitationsService {
  constructor(
    private readonly invitationRepo: InvitationRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
    private readonly tenantService: TenantService,
    private readonly sessionService: SessionService,
  ) {}

  async sendInvitation(
    dto: CreateInvitationDto,
    invitedByUserId: number,
  ): Promise<Invitation> {
    // Validate tenant exists
    const tenant = await this.tenantService.findOneTenant(dto.tenantId);

    // Validate branch exists if provided
    let branchName: string | undefined;
    if (dto.branchId) {
      const branch = await this.tenantService.findOneBranch(dto.branchId);
      branchName = branch.name;
    }

    // Validate role (only allow student, teacher, staff, accountant, parent)
    const allowedRoles = [
      RoleEnum.student,
      RoleEnum.teacher,
      RoleEnum.staff,
      RoleEnum.accountant,
      RoleEnum.parent,
    ];
    if (!allowedRoles.includes(dto.roleId)) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          roleId: 'Only student, teacher, staff, accountant, and parent roles can be invited',
        },
      });
    }

    // Check for existing pending invitation
    const existing = await this.invitationRepo.findPendingByEmail(
      dto.email,
      dto.tenantId,
    );
    if (existing) {
      throw new ConflictException(
        'A pending invitation already exists for this email in this tenant',
      );
    }

    // Create invitation record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const invitation = await this.invitationRepo.create({
      email: dto.email.toLowerCase(),
      roleId: dto.roleId,
      tenantId: dto.tenantId,
      branchId: dto.branchId ?? null,
      status: InvitationStatusEnum.pending,
      invitedBy: invitedByUserId,
      expiresAt,
    });

    // Generate JWT token
    const hash = await this.jwtService.signAsync(
      {
        invitationId: invitation.id,
        email: invitation.email,
        tenantId: invitation.tenantId,
        branchId: invitation.branchId,
        roleId: invitation.roleId,
      } as InvitationJwtPayload,
      {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
        expiresIn: '7d',
      },
    );

    // Send invitation email
    await this.mailService.sendInvitation({
      to: dto.email,
      data: {
        hash,
        tenantName: tenant.name,
        branchName,
        roleName: ROLE_NAMES[dto.roleId] ?? 'Member',
      },
    });

    return invitation;
  }

  async verifyInvitation(
    dto: VerifyInvitationDto,
  ): Promise<{
    email: string;
    tenantName: string;
    branchName?: string;
    roleName: string;
    roleId: number;
    existingUser: boolean;
  }> {
    const payload = await this.decodeHash(dto.hash);
    const invitation = await this.getValidInvitation(payload.invitationId);

    const tenant = await this.tenantService.findOneTenant(
      invitation.tenantId,
    );

    let branchName: string | undefined;
    if (invitation.branchId) {
      const branch = await this.tenantService.findOneBranch(
        invitation.branchId,
      );
      branchName = branch.name;
    }

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(
      invitation.email,
    );

    return {
      email: invitation.email,
      tenantName: tenant.name,
      branchName,
      roleName: ROLE_NAMES[invitation.roleId] ?? 'Member',
      roleId: invitation.roleId,
      existingUser: !!existingUser,
    };
  }

  async acceptInvitation(
    dto: AcceptInvitationDto,
  ): Promise<LoginResponseDto> {
    const payload = await this.decodeHash(dto.hash);
    const invitation = await this.getValidInvitation(payload.invitationId);

    // Check if user already exists
    let user = await this.usersService.findByEmail(invitation.email);

    if (!user) {
      // Create new user
      user = await this.usersService.create({
        email: invitation.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        password: dto.password,
        role: { id: invitation.roleId },
        status: { id: StatusEnum.active },
      });
      // Re-fetch to hydrate relations
      user = await this.usersService.findById(user.id);
      if (!user) {
        throw new UnprocessableEntityException({
          status: 422,
          errors: { user: 'Failed to create user' },
        });
      }
    }

    // Assign user to tenant
    try {
      await this.tenantService.assignUserToTenant({
        tenantId: invitation.tenantId,
        userId: user.id as number,
      });
    } catch {
      // User may already be assigned — that's fine (ConflictException)
    }

    // Mark invitation as accepted
    await this.invitationRepo.updateStatus(
      invitation.id,
      InvitationStatusEnum.accepted,
    );

    // Create session and return tokens (so user is logged in immediately)
    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const session = await this.sessionService.create({
      user,
      hash,
      tenantId: invitation.tenantId,
      branchId: invitation.branchId,
    });

    const { token, refreshToken, tokenExpires } =
      await this.getTokensData({
        id: user.id as number,
        role: user.role ? { id: user.role.id as number } : undefined,
        sessionId: session.id as number,
        hash,
        tenantId: invitation.tenantId,
      });

    return {
      refreshToken,
      token,
      tokenExpires,
      user,
    };
  }

  async findAllByTenant(tenantId: string): Promise<Invitation[]> {
    return this.invitationRepo.findAllByTenant(tenantId);
  }

  async cancelInvitation(id: string): Promise<void> {
    const invitation = await this.invitationRepo.findById(id);
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    if (invitation.status !== InvitationStatusEnum.pending) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: { status: 'Only pending invitations can be cancelled' },
      });
    }
    await this.invitationRepo.updateStatus(id, InvitationStatusEnum.cancelled);
  }

  async resendInvitation(id: string, invitedByUserId: number): Promise<void> {
    const invitation = await this.invitationRepo.findById(id);
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    if (invitation.status !== InvitationStatusEnum.pending) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: { status: 'Only pending invitations can be resent' },
      });
    }

    const tenant = await this.tenantService.findOneTenant(
      invitation.tenantId,
    );
    let branchName: string | undefined;
    if (invitation.branchId) {
      const branch = await this.tenantService.findOneBranch(
        invitation.branchId,
      );
      branchName = branch.name;
    }

    // Generate new JWT token
    const hash = await this.jwtService.signAsync(
      {
        invitationId: invitation.id,
        email: invitation.email,
        tenantId: invitation.tenantId,
        branchId: invitation.branchId,
        roleId: invitation.roleId,
      } as InvitationJwtPayload,
      {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
        expiresIn: '7d',
      },
    );

    // Send email again
    await this.mailService.sendInvitation({
      to: invitation.email,
      data: {
        hash,
        tenantName: tenant.name,
        branchName,
        roleName: ROLE_NAMES[invitation.roleId] ?? 'Member',
      },
    });
  }

  // ─── Private helpers ──────────────────────────────────

  private async decodeHash(hash: string): Promise<InvitationJwtPayload> {
    try {
      return await this.jwtService.verifyAsync<InvitationJwtPayload>(hash, {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
      });
    } catch {
      throw new UnprocessableEntityException({
        status: 422,
        errors: { hash: 'Invalid or expired invitation link' },
      });
    }
  }

  private async getValidInvitation(id: string): Promise<Invitation> {
    const invitation = await this.invitationRepo.findById(id);
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    if (invitation.status !== InvitationStatusEnum.pending) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          status: `Invitation has already been ${invitation.status}`,
        },
      });
    }
    if (new Date() > invitation.expiresAt) {
      await this.invitationRepo.updateStatus(
        id,
        InvitationStatusEnum.expired,
      );
      throw new UnprocessableEntityException({
        status: 422,
        errors: { status: 'Invitation has expired' },
      });
    }
    return invitation;
  }

  private async getTokensData(data: {
    id: number;
    role: { id: number } | undefined;
    sessionId: number;
    hash: string;
    tenantId?: string;
  }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });
    const tokenExpires = Date.now() + ms(tokenExpiresIn!);

    const [token, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: data.id,
          role: data.role,
          sessionId: data.sessionId,
          tenantId: data.tenantId,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', {
            infer: true,
          }),
          expiresIn: tokenExpiresIn,
        },
      ),
      this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
          hash: data.hash,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return { token, refreshToken, tokenExpires };
  }
}
