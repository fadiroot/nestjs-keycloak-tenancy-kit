import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LeaveTypeLocationsService } from './leaveTypeLocations.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { HandleErrors } from '../../common/decorators/error-handler.decorator';
import {
  SuccessResponse,
  SuccessResponsePaginate,
} from '../../common/utils/response/response.util';
import { I18nService } from 'nestjs-i18n';
import { QueryParams } from '../../common/dto/pagination.dto';

@ApiTags('leave-type-locations')
@ApiBearerAuth('access-token')
@ApiSecurity('organization-kc-id')
@Controller('leave-type-locations')
export class LeaveTypeLocationsController {
  constructor(
    private readonly leaveTypeLocationsService: LeaveTypeLocationsService,
    private readonly i18n: I18nService
  ) {}

  @Get(':leaveTypeId')
  @HandleErrors({
    resource: 'leaveTypeLocations',
    operation: 'getAll',
    i18nKey: 'leaveTypeLocations.getAll.error',
  })
  @ApiOperation({ summary: 'Get all leave type locations by leave type ID' })
  @ApiParam({
    name: 'leaveTypeId',
    type: String,
    description: 'Leave Type ID',
    required: true,
  })
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
    description: 'List of leave type locations retrieved successfully',
    type: SuccessResponsePaginate,
  })
  async getAllLeaveTypeLocationsByLeaveTypeId(
    @Param('leaveTypeId', ParseUUIDPipe) leaveTypeId: string,
    @Query() queryParams: QueryParams
  ) {
    const { docs, meta } =
      await this.leaveTypeLocationsService.getAllLeaveTypeLocationsByLeaveTypeId(
        leaveTypeId,
        queryParams
      );
    return new SuccessResponsePaginate(
      await this.i18n.t('leaveTypeLocations.getAll.success'),
      docs,
      meta
    );
  }

  @Get(':leaveTypeId/locations/:locationId')
  @HandleErrors({
    resource: 'leaveTypeLocations',
    operation: 'getOne',
    i18nKey: 'leaveTypeLocations.get.error',
  })
  @ApiOperation({
    summary:
      'Get a specific leave type location by leave type ID and location ID',
  })
  @ApiParam({
    name: 'leaveTypeId',
    type: String,
    description: 'Leave Type ID',
    required: true,
  })
  @ApiParam({
    name: 'locationId',
    type: String,
    description: 'Location ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leave type location retrieved successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Leave type location not found',
  })
  async getLeaveTypeLocation(
    @Param('leaveTypeId', ParseUUIDPipe) leaveTypeId: string,
    @Param('locationId', ParseUUIDPipe) locationId: string
  ) {
    const leaveTypeLocation =
      await this.leaveTypeLocationsService.getOneLeaveTypeLocation(
        leaveTypeId,
        locationId
      );
    return new SuccessResponse(
      await this.i18n.t('leaveTypeLocations.get.success'),
      leaveTypeLocation
    );
  }

  @Delete(':leaveTypeId/locations/:locationId')
  @HandleErrors({
    resource: 'leaveTypeLocations',
    operation: 'delete',
    i18nKey: 'leaveTypeLocations.delete.error',
  })
  @ApiOperation({ summary: 'Delete a leave type location' })
  @ApiParam({
    name: 'leaveTypeId',
    type: String,
    description: 'Leave Type ID',
    required: true,
  })
  @ApiParam({
    name: 'locationId',
    type: String,
    description: 'Location ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leave type location deleted successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Leave type location not found',
  })
  async deleteLeaveTypeLocation(
    @Param('leaveTypeId', ParseUUIDPipe) leaveTypeId: string,
    @Param('locationId', ParseUUIDPipe) locationId: string
  ) {
    const deletedLeaveTypeLocation =
      await this.leaveTypeLocationsService.deleteLeaveTypeLocation(
        leaveTypeId,
        locationId
      );
    return new SuccessResponse(
      await this.i18n.t('leaveTypeLocations.delete.success'),
      deletedLeaveTypeLocation
    );
  }
}
