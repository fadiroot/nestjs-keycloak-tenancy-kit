import {
  Controller,
  Post,
  Get,
  Body,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Req,
  Put,
  Param,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/createTenant.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
  ApiBasicAuth,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { UpdateTenantDto } from './dto/updateTenant.dto';
import {
  SuccessResponse,
} from '../common/utils/response/response.util';
import { I18nService } from 'nestjs-i18n';
import { HandleErrors } from '../common/decorators/error-handler.decorator';
import { Public } from 'nest-keycloak-connect';
import { SuperAdminGuard } from '../modules/auth/guards/superAdmin.guard';
 
@ApiTags('tenants')
@Controller('tenants')
@ApiBearerAuth('access-token')
@ApiHeader({
  name: 'Accept-Language',
  description: 'languges',
  example: 'en',
})
export class TenantController {
  constructor(
    private readonly tenantService: TenantService,
    private readonly i18n: I18nService
  ) {}

  @Public()
  @Post()
  @UseGuards(SuperAdminGuard)
  
  @HandleErrors({
    resource: 'tenants',
    operation: 'post',
    i18nKey: 'tenants.create.error',
  })
  @ApiOperation({
    summary: 'Create a new tenant',
    description: 'Creates a new tenant with the provided information',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The tenant has been successfully created',
    type: CreateTenantDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid tenant data provided',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Tenant with this domain already exists',
  })
  async createTenant(@Body(ValidationPipe) createTenantDto: CreateTenantDto) {
    const tenant = await this.tenantService.createTenant(createTenantDto);
    

    return new SuccessResponse(
      await this.i18n.t('tenants.create.success'),
      tenant,
      HttpStatus.CREATED
    );
  }

  @Put(':id')
  @HandleErrors({
    resource: 'tenants',
    operation: 'put',
    i18nKey: 'tenants.update.error',
  })
  @ApiOperation({
    summary: 'Update a tenant',
    description: 'Updates an existing tenant with the provided information',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the tenant to update',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The tenant has been successfully updated',
    type: UpdateTenantDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid tenant data provided',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tenant not found',
  })
  async updateTenant(
    @Param('id') id: string,
    @Body(ValidationPipe) updateTenantDto: UpdateTenantDto
  ) {
    const result: any = await this.tenantService.updateTenant(
      id,
      updateTenantDto
    );
    console.log({ result });
    return new SuccessResponse(
      await this.i18n.t('tenants.update.success', {
        args: { name: updateTenantDto.name },
      }),
      result,
      HttpStatus.OK
    );
  }

  
}
