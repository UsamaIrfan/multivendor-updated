import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import databaseConfig from '../../database/config/database.config';
import { DatabaseConfig } from '../../database/config/database-config.type';

// <database-block>
const idType = (databaseConfig() as DatabaseConfig).isDocumentDatabase
  ? String
  : Number;
// </database-block>

export class RoleDto {
  @ApiProperty({ type: idType })
  @IsNumber()
  id: number | string;
}
