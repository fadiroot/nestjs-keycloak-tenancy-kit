import { Global, Module } from '@nestjs/common';
import { DropboxService } from './dropbox.service';
import { DropboxController } from './dropbox.controller';


@Global()
@Module({
    controllers: [DropboxController],
    providers: [DropboxService],
    exports: [DropboxService]
})
export class DropboxModule { } 