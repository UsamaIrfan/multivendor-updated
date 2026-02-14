import { Injectable, UnprocessableEntityException } from '@nestjs/common';

export interface CsvRow {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  gender: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  guardianRelation?: string;
  address?: string;
  city?: string;
}

export interface CsvParseResult {
  validRows: CsvRow[];
  errors: Array<{ row: number; message: string }>;
}

@Injectable()
export class StudentImportService {
  /**
   * Parse and validate a CSV buffer.
   * Returns valid rows and a list of row-level errors.
   */
  parseAndValidateCsv(buffer: Buffer, filename: string): CsvParseResult {
    // Validate file extension
    if (!filename.toLowerCase().endsWith('.csv')) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          file: 'Only CSV files are supported',
        },
      });
    }

    const content = buffer.toString('utf-8').trim();
    const lines = content.split('\n').map((line) => line.trim());

    if (lines.length < 2) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          file: 'CSV file must contain a header row and at least one data row',
        },
      });
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const requiredHeaders = [
      'firstName',
      'lastName',
      'email',
      'password',
      'dateOfBirth',
      'gender',
      'guardianName',
      'guardianPhone',
    ];

    for (const req of requiredHeaders) {
      if (!headers.includes(req)) {
        throw new UnprocessableEntityException({
          status: 422,
          errors: {
            file: `CSV is missing required header: ${req}`,
          },
        });
      }
    }

    const validRows: CsvRow[] = [];
    const errors: Array<{ row: number; message: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i] || lines[i].trim() === '') continue;

      const values = lines[i].split(',').map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });

      const rowNumber = i + 1; // 1-based, accounting for header
      const rowErrors: string[] = [];

      // Validate required fields
      if (!row['firstName']) rowErrors.push('firstName is required');
      if (!row['lastName']) rowErrors.push('lastName is required');
      if (!row['email']) rowErrors.push('email is required');
      if (!row['password']) rowErrors.push('password is required');
      if (!row['dateOfBirth']) rowErrors.push('dateOfBirth is required');
      if (!row['gender']) rowErrors.push('gender is required');
      if (!row['guardianName']) rowErrors.push('guardianName is required');
      if (!row['guardianPhone']) rowErrors.push('guardianPhone is required');

      if (rowErrors.length > 0) {
        errors.push({
          row: rowNumber,
          message: rowErrors.join('; '),
        });
      } else {
        validRows.push({
          firstName: row['firstName'],
          lastName: row['lastName'],
          email: row['email'],
          password: row['password'],
          dateOfBirth: row['dateOfBirth'],
          gender: row['gender'],
          guardianName: row['guardianName'],
          guardianPhone: row['guardianPhone'],
          guardianEmail: row['guardianEmail'] || undefined,
          guardianRelation: row['guardianRelation'] || undefined,
          address: row['address'] || undefined,
          city: row['city'] || undefined,
        });
      }
    }

    return { validRows, errors };
  }
}
