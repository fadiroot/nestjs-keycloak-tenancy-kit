import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Query,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { I18nService } from 'nestjs-i18n';
import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../../common/utils/response/response.util';
import { LOCATION } from './location.constants';
import { CreateLocationDto } from './dto/createLocation.dto';
import { UpdateLocationDto } from './dto/updateLocation.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiExtraModels,
  ApiBody,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { HandleErrors } from '../../common/decorators/error-handler.decorator';
import { QueryParams } from '../../common/dto/pagination.dto';
import { HasPermission } from '../auth/decorators/PermissionUser.decorator';
import { Permissions } from '../permission/enum/permission.enum';
import { TenantProtected } from '../auth/decorators/tenantProtected.decorator';

@ApiTags(LOCATION)
@ApiBearerAuth('access-token')
@ApiSecurity('organization-kc-id')
@ApiExtraModels(SuccessResponse, SuccessMsgResponse, SuccessResponsePaginate)
@Controller(LOCATION)
export class LocationController {
  constructor(
    private readonly locationService: LocationService,
    private readonly i18n: I18nService
  ) { }

  @Post()
  @HasPermission(Permissions.LOCATIONS_CREATE)
  @TenantProtected()
  @HandleErrors({
    resource: LOCATION,
    operation: 'post',
    i18nKey: 'locations.create.error',
  })
  @ApiOperation({ summary: 'Create a new location' })
  @ApiBody({ type: CreateLocationDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Location has been successfully created.',
    type: SuccessResponse,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request.' })
  async createLocation(
    @Body(ValidationPipe) createLocationDto: CreateLocationDto
  ) {
    const location =
      await this.locationService.createLocation(createLocationDto);
    return new SuccessResponse(
      this.i18n.t('locations.create.success'),
      location,
      HttpStatus.CREATED
    );
  }

  @Get()
  @HasPermission(Permissions.LOCATIONS_LIST)
  @TenantProtected()
  @HandleErrors({
    resource: LOCATION,
    operation: 'getAll',
    i18nKey: 'locations.getAll.error',
  })
  @ApiOperation({ summary: 'Get all locations' })
  @ApiQuery({
    name: 'page',
    type: String,
    required: false,
    example: 1,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    type: String,
    required: false,
    example: 10,
    description: 'Number of records per page',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of locations retrieved successfully',
    type: SuccessResponsePaginate,
  })
  async getAllLocations(@Query() queryParams: QueryParams) {
    const { docs, meta } =
      await this.locationService.getAllLocations(queryParams);
    return new SuccessResponsePaginate(
      await this.i18n.t('locations.getAll.success'),
      docs,
      meta
    );
  }

  @Get(':id')
  @HasPermission(Permissions.LOCATIONS_READ)
  @TenantProtected()
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Location ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Location retrieved successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Location not found',
  })
  @HandleErrors({
    resource: LOCATION,
    operation: 'getOne',
    i18nKey: 'locations.get.error',
  })
  async getOneLocation(@Param('id', ParseUUIDPipe) id: string) {
    const location = await this.locationService.getOneLocation(id);
    return new SuccessResponse(
      await this.i18n.t('locations.get.success'),
      location
    );
  }

  @Patch(':id')
  @HasPermission(Permissions.LOCATIONS_UPDATE)
  @TenantProtected()
  @ApiOperation({ summary: 'Update location' })
  @ApiParam({ name: 'id', type: String, description: 'Location ID' })
  @ApiBody({ type: UpdateLocationDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Location updated successfully',
    type: SuccessResponse,
  })
  @HandleErrors({
    resource: LOCATION,
    operation: 'update',
    i18nKey: 'locations.update.error',
  })
  async updateLocation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateLocationDto: UpdateLocationDto
  ) {
    const updatedLocation = await this.locationService.updateLocation(
      id,
      updateLocationDto
    );
    return new SuccessResponse(
      await this.i18n.t('locations.update.success', {
        args: { name: updatedLocation.name },
      }),
      updatedLocation
    );
  }

  @Delete(':id')
  @HasPermission(Permissions.LOCATIONS_DELETE)
  @TenantProtected()
  @ApiOperation({ summary: 'Delete location' })
  @ApiParam({ name: 'id', type: String, description: 'Location ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Location deleted successfully',
    type: SuccessMsgResponse,
  })
  @HandleErrors({
    resource: LOCATION,
    operation: 'delete',
    i18nKey: 'locations.delete.error',
  })
  async deleteLocation(@Param('id', ParseUUIDPipe) id: string) {
    const deletedLocation = await this.locationService.deleteLocation(id);
    return new SuccessMsgResponse(
      await this.i18n.t('locations.delete.success', {
        args: { name: deletedLocation.name },
      })
    );
  }
}
