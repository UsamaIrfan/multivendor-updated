import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AuditLog domain — immutable audit trail of user actions.
 */
export class AuditLog {
  @ApiProperty({ type: String, format: 'uuid' })
  id: string;

  @ApiProperty({ type: String, format: 'uuid' })
  tenantId: string;

  @ApiProperty({ type: Number })
  userId: number;

  @ApiProperty({ example: 'academic.attendance.mark' })
  action: string;

  @ApiPropertyOptional({ example: 'student_attendance' })
  resourceType: string | null;

  @ApiPropertyOptional({ example: '42' })
  resourceId: string | null;

  @ApiPropertyOptional({ type: Object })
  details: Record<string, any> | null;

  @ApiPropertyOptional({ example: '192.168.1.1' })
  ipAddress: string | null;

  @ApiProperty()
  createdAt: Date;
}
