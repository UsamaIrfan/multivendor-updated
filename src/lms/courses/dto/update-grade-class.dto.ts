import { PartialType } from '@nestjs/swagger';
import { CreateGradeClassDto } from './create-grade-class.dto';

export class UpdateGradeClassDto extends PartialType(CreateGradeClassDto) {}
