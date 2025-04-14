import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class UploadFileDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'file'
      })
      @IsOptional()
      file?: Express.Multer.File;
}