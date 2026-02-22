import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';
import { GenderEnum, BloodGroupEnum } from '../../common/enums/general.enum';

export class Student extends LmsBaseDomain {
  @ApiProperty({ type: Number })
  userId!: number;

  @ApiProperty({ type: Number })
  institutionId!: number;

  @ApiProperty({ type: String, example: 'STU-001' })
  rollNumber!: string;

  @ApiPropertyOptional({ type: Date })
  dateOfBirth!: Date | null;

  @ApiPropertyOptional({ enum: GenderEnum })
  gender!: GenderEnum | null;

  @ApiPropertyOptional({ type: String })
  guardianName!: string | null;

  @ApiPropertyOptional({ type: String })
  guardianPhone!: string | null;

  @ApiPropertyOptional({ type: String })
  guardianEmail!: string | null;

  @ApiPropertyOptional({ type: String })
  guardianRelation!: string | null;

  @ApiPropertyOptional({ type: String })
  address!: string | null;

  @ApiPropertyOptional({ type: String })
  city!: string | null;

  @ApiPropertyOptional({ enum: BloodGroupEnum })
  bloodGroup!: BloodGroupEnum | null;

  @ApiPropertyOptional({ type: String })
  nationality!: string | null;

  @ApiPropertyOptional({ type: String })
  religion!: string | null;

  @ApiPropertyOptional({ type: Date })
  admissionDate!: Date | null;

  // Populated from User relation
  @ApiPropertyOptional({ type: String })
  firstName?: string | null;

  @ApiPropertyOptional({ type: String })
  lastName?: string | null;

  @ApiPropertyOptional({ type: String })
  email?: string | null;
}
