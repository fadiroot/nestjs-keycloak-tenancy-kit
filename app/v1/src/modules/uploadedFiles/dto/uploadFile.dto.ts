import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { UPLOADED_FILES_TABLE } from '../../dropbox/dropbox.constants';

@ModuleName(UPLOADED_FILES_TABLE)
export class UploadFileDto {
  @ApiProperty({
    description: 'entity id represent the uploaded file ',
    example: 'e4eaaaf2-d142-11e1-b3e4-080027620cdd',
  })
  @IsUUID()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({
    description: 'entity type related to the uploaded file',
    example: 'leave',
  })
  @IsString()
  @IsNotEmpty()
  entityType: string;
  
  @ApiProperty({
    description: 'url of the uploaded file',
    example: 'leave',
  })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;
}
