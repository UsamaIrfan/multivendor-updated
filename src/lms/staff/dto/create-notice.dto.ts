import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TargetAudienceEnum } from '../../common/enums/general.enum';

export class CreateNoticeDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  institutionId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  publishedById?: number | null;

  @ApiProperty({ example: 'Annual Day celebration' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Annual Day will be held on...' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({
    enum: TargetAudienceEnum,
    default: TargetAudienceEnum.all,
  })
  @IsOptional()
  @IsEnum(TargetAudienceEnum)
  targetAudience?: TargetAudienceEnum;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: '2025-07-01' })
  @IsOptional()
  @IsDateString()
  publishDate?: string | null;

  @ApiPropertyOptional({ example: '2025-08-01' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string | null;
}
