import { TenantDatabase } from '../../tenants/database/database';
import { Inject } from '@nestjs/common';
import { TENANT_DB } from '../../tenants/constants';
import { UPLOADED_FILES_TABLE } from '../dropbox/dropbox.constants';
import { UploadFileDto } from './dto/uploadFile.dto';
import { UploadedFilesMapper } from './interfaces/uploadedFile.interface';

export class UploadedFileRepository {
  constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase) {}

  async bulkInsertAttachments(attachments: UploadFileDto[]) {
    attachments = UploadedFilesMapper.toInsertable(attachments);
    const result = await this.tenantDb
      .insertInto(UPLOADED_FILES_TABLE)
      .values(attachments)
      .returningAll()
      .execute();

    return result ? UploadedFilesMapper.toDomain(attachments) : null;
  }
}
