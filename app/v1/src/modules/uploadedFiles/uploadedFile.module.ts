import { Module } from '@nestjs/common';
import { UploadedFileRepository } from './uploadedFile.repository';
import { UploadedFileService } from './uploadedFile.service';

@Module({
    controllers: [],
    providers: [UploadedFileService,UploadedFileRepository],
    exports: [UploadedFileService]
})
export class UploadedFileModule { } 