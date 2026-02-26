import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from '../lms/student/infrastructure/persistence/relational/entities/student.entity';

@Injectable()
export class StudentIdGeneratorService {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly studentRepo: Repository<StudentEntity>,
  ) {}

  /**
   * Generates a unique student ID in format: STU-YYYY-XXXX
   * where YYYY is current year and XXXX is a zero-padded sequence.
   *
   * Uses a raw query to find the max sequence globally (not tenant-filtered)
   * to prevent collisions across tenants. An optional `offset` allows
   * bulk import to increment safely within a single batch.
   */
  async generate(offset = 0): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `STU-${year}-`;

    // Query max rollNumber globally (across all tenants, including soft-deleted)
    const result = await this.studentRepo
      .createQueryBuilder('s')
      .select('s.rollNumber', 'rollNumber')
      .withDeleted()
      .where('s.rollNumber LIKE :likePrefix', { likePrefix: `${prefix}%` })
      .orderBy(
        "CAST(REPLACE(s.rollNumber, :prefix, '') AS INTEGER)",
        'DESC',
      )
      .setParameter('prefix', prefix)
      .limit(1)
      .getRawOne();

    let maxSequence = 0;
    if (result?.rollNumber) {
      const seqStr = (result.rollNumber as string).replace(prefix, '');
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq)) maxSequence = seq;
    }

    const nextSequence = maxSequence + 1 + offset;
    return `${prefix}${String(nextSequence).padStart(4, '0')}`;
  }
}
