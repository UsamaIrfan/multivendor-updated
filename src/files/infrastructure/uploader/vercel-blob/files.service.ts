import {
  HttpStatus,
  Injectable,
  PayloadTooLargeException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { put } from '@vercel/blob';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

import { FileRepository } from '../../persistence/file.repository';
import { AllConfigType } from '../../../../config/config.type';
import { FileType } from '../../../domain/file';

@Injectable()
export class FilesVercelBlobService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly fileRepository: FileRepository,
  ) {}

  async create(file: Express.Multer.File): Promise<{ file: FileType }> {
    if (!file) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          file: 'selectFile',
        },
      });
    }

    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|docx)$/i)) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          file: 'cantUploadFileType',
        },
      });
    }

    const maxFileSize =
      this.configService.get('file.maxFileSize', { infer: true }) || 0;

    if (file.size > maxFileSize) {
      throw new PayloadTooLargeException({
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        error: 'Payload Too Large',
        message: 'File too large',
      });
    }

    const ext = file.originalname.split('.').pop()?.toLowerCase();
    const filename = `${randomStringGenerator()}.${ext}`;

    const blob = await put(filename, file.buffer, {
      access: 'public',
      token: this.configService.getOrThrow('file.vercelBlobToken', {
        infer: true,
      }),
    });

    return {
      file: await this.fileRepository.create({
        path: blob.url,
      }),
    };
  }
}
