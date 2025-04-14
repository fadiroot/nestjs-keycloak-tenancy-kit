import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    Body,
    UseInterceptors as UseInterceptor
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiConsumes,
    ApiBody,
    ApiResponse,
    ApiBearerAuth,
    ApiSecurity
} from '@nestjs/swagger';
import { DropboxService } from './dropbox.service';
import { UploadFileDto } from './dto/uploadFile.dto';
import { TenantProtected } from '../auth/decorators/tenantProtected.decorator';
import { DROPBOX } from './dropbox.constants';

@ApiTags(DROPBOX)
@ApiBearerAuth('access-token')
@ApiSecurity('organization-kc-id')
@TenantProtected()
@Controller(DROPBOX)
export class DropboxController {
    constructor(private readonly dropboxService: DropboxService) { }

    @Post('profilePicture')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload file to Dropbox' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'File upload',
        type: UploadFileDto,
    })
    @ApiResponse({
        status: 201,
        description: 'File uploaded successfully',
        schema: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    description: 'Dropbox shared link URL'
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request'
    })
    @ApiResponse({
        status: 500,
        description: 'Internal Server Error'
    })
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() uploadFileDto: UploadFileDto
    ) {
        const fileUrl = await this.dropboxService.uploadFile(
            file.buffer
        );
        return { url: fileUrl };
    }
}
