import { PartialType } from '@nestjs/swagger';
import { CreateBranchIncomeDto } from './create-branch-income.dto';

export class UpdateBranchIncomeDto extends PartialType(CreateBranchIncomeDto) {}
