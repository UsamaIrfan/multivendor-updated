import { UnprocessableEntityException } from '@nestjs/common';

/**
 * Validates that a student meets the minimum age requirement (5 years).
 * @throws UnprocessableEntityException if the student is under 5 years old
 */
export function validateStudentAge(dateOfBirth: string): void {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  if (age < 5) {
    throw new UnprocessableEntityException({
      status: 422,
      errors: {
        dateOfBirth: 'Student must be at least 5 years old for enrollment',
      },
    });
  }
}

/**
 * Validates that guardian information is provided.
 * @throws UnprocessableEntityException if guardian info is missing
 */
export function validateGuardianInfo(data: {
  guardianName?: string | null;
  guardianPhone?: string | null;
}): void {
  if (!data.guardianName || data.guardianName.trim() === '') {
    throw new UnprocessableEntityException({
      status: 422,
      errors: {
        guardianName: 'Guardian name is required',
      },
    });
  }
  if (!data.guardianPhone || data.guardianPhone.trim() === '') {
    throw new UnprocessableEntityException({
      status: 422,
      errors: {
        guardianPhone: 'Guardian phone is required',
      },
    });
  }
}
