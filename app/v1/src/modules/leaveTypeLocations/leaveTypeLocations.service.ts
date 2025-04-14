import {
  BadRequestException,
  NotFoundException,
} from '../../common/exceptions/application.exceptions';
import { I18nService } from 'nestjs-i18n';
import { Injectable } from '@nestjs/common';
import { CreateLeaveTypeLocationDto } from '../leaveTypeLocations/dto/createLeaveTypeLocation.dto';
import { UpdateLeaveTypeLocationDto } from '../leaveTypeLocations/dto/updateLeaveTypeLocation.dto';
import { LeaveTypeLocationsRepository } from '../leaveTypeLocations/leaveTypeLocations.repository';
import { QueryParams } from '../../common/dto/pagination.dto';
import { BaseService } from '../../common/helpers/baseService.helper';

@Injectable()
export class LeaveTypeLocationsService extends BaseService {
  constructor(
    private readonly leaveTypeLocationsRepository: LeaveTypeLocationsRepository,
    private readonly i18n: I18nService
  ) {
    super();
  }

  async createLeaveTypeLocations(
    createLeaveTypeLocationDto: CreateLeaveTypeLocationDto[]
  ) {
    const existingLeaveTypeLocations =
      await this.leaveTypeLocationsRepository.findAllLeaveTypeLocationsExist(
        createLeaveTypeLocationDto
      );

    if (
      existingLeaveTypeLocations.length > 0 &&
      existingLeaveTypeLocations.length == createLeaveTypeLocationDto.length
    )
      throw new BadRequestException(
        this.i18n,
        'leaveTypeLocations',
        'create.alreadyExists'
      );
    return await this.leaveTypeLocationsRepository.createLeaveTypeLocations(
      createLeaveTypeLocationDto
    );
  }

  async getAllLeaveTypeLocationsByLeaveTypeId(
    leaveTypeId: string,
    queryParams: QueryParams
  ) {
    return this.getPaginatedData(
      queryParams,
      this.leaveTypeLocationsRepository.findAllLeaveTypeLocations.bind(
        this.leaveTypeLocationsRepository
      ),
      [leaveTypeId]
    );
  }

  async getAllLeaveTypeLocationsExist(
    leaveTypeLocations: CreateLeaveTypeLocationDto[]
  ) {
    return await this.leaveTypeLocationsRepository.findAllLeaveTypeLocationsExist(
      leaveTypeLocations
    );
  }

  async getOneLeaveTypeLocation(leaveTypeId: string, locationId: string) {
    const leaveTypeLocation =
      await this.leaveTypeLocationsRepository.findLeaveTypeLocationByObj({
        leaveTypeId,
        locationId,
      });
    if (!leaveTypeLocation)
      throw new NotFoundException(
        this.i18n,
        'leaveTypeLocations',
        `${leaveTypeId} , ${locationId}`
      );
    return leaveTypeLocation;
  }

  async updateLeaveTypeLocation(
    leaveTypeId: string,
    locationId: string,
    updateLeaveTypeLocationDto: UpdateLeaveTypeLocationDto
  ) {
    const leaveTypeLocation =
      await this.leaveTypeLocationsRepository.findLeaveTypeLocationByObj({
        leaveTypeId,
        locationId,
      });
    if (!leaveTypeLocation)
      throw new NotFoundException(
        this.i18n,
        'leaveTypeLocations',
        `${leaveTypeId} , ${locationId}`
      );
    return await this.leaveTypeLocationsRepository.updateLeaveTypeLocation(
      leaveTypeId,
      locationId,
      updateLeaveTypeLocationDto
    );
  }

  async deleteLeaveTypeLocation(leaveTypeId: string, locationId: string) {
    const leaveTypeLocation =
      await this.leaveTypeLocationsRepository.findLeaveTypeLocationByObj({
        leaveTypeId,
        locationId,
      });
    if (!leaveTypeLocation)
      throw new NotFoundException(
        this.i18n,
        'leaveTypeLocations',
        `${leaveTypeId} , ${locationId}`
      );
    await this.leaveTypeLocationsRepository.deleteLeaveTypeLocation(
      leaveTypeId,
      locationId
    );
    return leaveTypeLocation;
  }
}
