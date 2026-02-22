import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Permission domain — a granular action a user can perform.
 */
export class Permission {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ example: 'academic.student.read' })
  code: string;

  @ApiProperty({ example: 'academic' })
  domain: string;

  @ApiPropertyOptional({ example: 'View student records' })
  description: string | null;

  @ApiProperty()
  createdAt: Date;
}
