import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { StudentRepository } from '../../lms/student/infrastructure/persistence/student.repository';
import { RoleEnum } from '../../roles/roles.enum';

/**
 * Guard that ensures students can only access their own records.
 * Admin, teacher, and staff roles bypass this check.
 */
@Injectable()
export class StudentOwnershipGuard implements CanActivate {
  constructor(private readonly studentRepository: StudentRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const studentId = request.params?.id;

    // If no :id param, allow (e.g. list/create endpoints)
    if (!studentId) {
      return true;
    }

    // Admin, teacher, staff — full access
    const roleId = user?.role?.id;
    if (
      roleId === RoleEnum.admin ||
      roleId === RoleEnum.teacher ||
      roleId === RoleEnum.staff
    ) {
      return true;
    }

    // Student role — must own the record
    const student = await this.studentRepository.findById(
      parseInt(studentId, 10),
    );
    if (!student || (student as any).userId !== user.id) {
      throw new ForbiddenException(
        'You can only access your own student record',
      );
    }

    return true;
  }
}
