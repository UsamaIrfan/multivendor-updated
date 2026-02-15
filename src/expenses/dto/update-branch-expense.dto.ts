import { PartialType } from '@nestjs/swagger';
import { CreateBranchExpenseDto } from './create-branch-expense.dto';

export class UpdateBranchExpenseDto extends PartialType(
  CreateBranchExpenseDto,
) {}
