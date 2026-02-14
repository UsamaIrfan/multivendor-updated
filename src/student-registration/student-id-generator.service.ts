import { Injectable } from '@nestjs/common';
import { StudentRepository } from '../lms/student/infrastructure/persistence/student.repository';

@Injectable()
export class StudentIdGeneratorService {
  constructor(private readonly studentRepository: StudentRepository) {}

  /**
   * Generates a unique student ID in format: STU-YYYY-XXXX
   * where YYYY is current year and XXXX is a zero-padded sequence.
   */
  async generate(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `STU-${year}-`;

    // Get all students to find the highest sequence number for this year
    const allStudents = await this.studentRepository.findAll();
    let maxSequence = 0;

    for (const student of allStudents) {
      const rollNumber = (student as any).rollNumber || '';
      if (rollNumber.startsWith(prefix)) {
        const seqStr = rollNumber.replace(prefix, '');
        const seq = parseInt(seqStr, 10);
        if (!isNaN(seq) && seq > maxSequence) {
          maxSequence = seq;
        }
      }
    }

    const nextSequence = maxSequence + 1;
    return `${prefix}${String(nextSequence).padStart(4, '0')}`;
  }
}
