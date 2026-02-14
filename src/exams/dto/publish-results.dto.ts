import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class PublishResultsDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  gradingScaleId!: number;
}
