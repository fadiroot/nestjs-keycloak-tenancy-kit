import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTenantDto {
    @ApiPropertyOptional({
        description: 'The name of the tenant',
        example: 'Acme Corporation'
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({
        description: 'The domain name for the tenant',
        example: 'acme.com'
    })
    @IsString()
    @IsOptional()
    domain?: string;

    @ApiPropertyOptional({
        description: 'Email address of the tenant owner',
        example: 'owner@acme.com'
    })
    @IsEmail()
    @IsOptional()
    ownerEmail?: string;

    @ApiPropertyOptional({
        description: 'First name of the tenant owner',
        example: 'John'
    })
    @IsString()
    @IsOptional()
    ownerFirstName?: string;

    @ApiPropertyOptional({
        description: 'Last name of the tenant owner',
        example: 'Doe'
    })
    @IsString()
    @IsOptional()
    ownerLastName?: string;
}