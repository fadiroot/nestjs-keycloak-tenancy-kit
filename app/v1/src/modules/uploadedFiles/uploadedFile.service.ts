import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { BaseService } from '../../common/helpers/baseService.helper';
import { UploadFileDto } from './dto/uploadFile.dto';
import { UploadedFileRepository } from './uploadedFile.repository';

@Injectable()
export class UploadedFileService extends BaseService {
  constructor(
    private readonly uploadedFileService: UploadedFileRepository,
    private readonly i18n: I18nService
  ) {
    super();
  }
  async insertUploadedFilesUrls(
    uploadedFiles: UploadFileDto[]
  ) {
    return await this.uploadedFileService.bulkInsertAttachments(uploadedFiles);
  }
}
