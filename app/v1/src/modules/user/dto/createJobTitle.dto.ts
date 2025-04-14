import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class JobTitleDto {
    @ApiProperty({
        description: 'The title of the job',
        example: 'Software Engineer',
    })
    @IsString()
    @IsNotEmpty()
    jobTitle: string;
}
