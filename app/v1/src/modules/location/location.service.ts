import { Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/createLocation.dto';
import { UpdateLocationDto } from './dto/updateLocation.dto';
import { I18nService } from 'nestjs-i18n';
import { LocationRepository } from './location.repository';
import {
  BadRequestException,
  NotFoundException,
} from '../../common/exceptions/application.exceptions';
import { LOCATION } from './location.constants';
import { LocationMapper } from './interfaces/location.interface';
import { UserService } from '../user/user.service';
import { validateEntityIds } from '../../common/utils/validation.utils';
import { PaginationUtils } from '../../common/utils/pagination.util';
import { QueryParams } from '../../common/dto/pagination.dto';
import { BaseService } from '../../common/helpers/baseService.helper';

@Injectable()
export class LocationService extends BaseService {
  constructor(
    private readonly i18n: I18nService,
    private readonly locationRepository: LocationRepository,
    private readonly userService: UserService
  ) {
    super();
  }
  async createLocation(createLocationDto: CreateLocationDto) {
    const { users } = createLocationDto;
    const location = await this.locationRepository.findLocationByName(
      createLocationDto.name
    );
    if (location)
      throw new BadRequestException(this.i18n, LOCATION, 'name.alreadyExists');
    if (users)
      await validateEntityIds(
        this.i18n,
        await this.userService.findAll(users),
        users,
        'Users'
      );

    const newLocation =
      await this.locationRepository.createLocation(createLocationDto);
    if (users)
      await this.userService.updateUsersWithIds(
        { location_id: newLocation.id },
        users
      );
    return LocationMapper.toDomain(newLocation);
  }

  async getAllLocations(queryParams: QueryParams) {
    return await this.getPaginatedData(
      queryParams,
      this.locationRepository.findAllLocations.bind(this.locationRepository)
    );
  }
  async findAllForStat() {
    return await this.locationRepository.findAllForStat();
  }

  async getAllLocationsIds() {
    return await this.locationRepository.findAllLocationsIds();
  }

  async getAllLocationsExists(ids: string[]) {
    return await this.locationRepository.findAllLocationsExist(ids);
  }

  async getOneLocation(id: string) {
    const location = await this.locationRepository.findLocationById(id);
    if (!location) throw new NotFoundException(this.i18n, LOCATION, id);
    return location;
  }

  async updateLocation(
    id: string,
    updateLocationDto: UpdateLocationDto
  ): Promise<UpdateLocationDto> {
    const { users } = updateLocationDto;
    const location = await this.locationRepository.findLocationById(id);
    if (!location) throw new NotFoundException(this.i18n, LOCATION, id);
    if (users && users.length) {
      await validateEntityIds(
        this.i18n,
        await this.userService.findAll(users),
        users,
        'Users'
      );
      await this.userService.updateUsersWithIds(
        { location_id: location.id },
        users
      );
    }
    return await this.locationRepository.updateLocation(id, updateLocationDto);
  }

  async deleteLocation(id: string) {
    const location = await this.locationRepository.findLocationById(id);
    if (!location) throw new NotFoundException(this.i18n, LOCATION, id);
    await this.locationRepository.deleteLocation(id);
    return location;
  }
}
