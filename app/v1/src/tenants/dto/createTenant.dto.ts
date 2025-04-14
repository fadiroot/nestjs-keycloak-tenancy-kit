import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ModuleName } from '../../common/decorators/module-name.decorator';
@ModuleName('tenants')
export class CreateTenantDto {
    @ApiProperty({
        description: 'The name of the tenant',
        example: 'Acme Corporation'
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'The domain name for the tenant',
        example: 'acme.com'
    })
    @IsString()
    @IsNotEmpty()
    domain: string;

  
}
