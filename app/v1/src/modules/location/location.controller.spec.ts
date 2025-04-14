import { Test, TestingModule } from '@nestjs/testing';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/createLocation.dto';
import { UpdateLocationDto } from './dto/updateLocation.dto';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import {
  SuccessResponse,
  SuccessMsgResponse,
  SuccessResponsePaginate,
} from '../../common/utils/response/response.util';
import {
  LeaveQuotaResetOptions,
  Months,
  WeekStartOptions,
} from './enums/location.enums';
import { UserService } from '../user/user.service';
import { Reflector } from '@nestjs/core';
import { TenantAccessGuard } from '../auth/guards/tenantAccess.guard';
import { RolePermissionService } from '../rolePermission/rolePermission.service';
import { PermissionGuard } from '../auth/guards/permisson.guard';

// Mock the PermissionGuard
class MockPermissionGuard {
  canActivate = jest.fn().mockReturnValue(true);
}

describe('LocationController', () => {
  let controller: LocationController;
  let locationService: LocationService;
  let i18nService: I18nService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [
        {
          provide: LocationService,
          useValue: {
            createLocation: jest.fn(),
            getAllLocations: jest.fn(),
            getOneLocation: jest.fn(),
            updateLocation: jest.fn(),
            deleteLocation: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockResolvedValue('mocked translation'),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: RolePermissionService,
          useValue: {
            checkPermission: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: TenantAccessGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: PermissionGuard,
          useClass: MockPermissionGuard,
        },
      ],
    }).compile();

    controller = module.get<LocationController>(LocationController);
    locationService = module.get<LocationService>(LocationService);
    i18nService = module.get<I18nService>(I18nService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createLocation', () => {
    it('should create a location', async () => {
      const createLocationDto: CreateLocationDto = {
        name: 'New York Office',
        workWeek: [WeekStartOptions.MONDAY, WeekStartOptions.THURSDAY],
        weekStartsOn: WeekStartOptions.MONDAY,
        leaveQuotaResetBasedOn: LeaveQuotaResetOptions.ACCOUNTING_YEAR,
        timeZone: 'America/New_York',
        fiscalYearStartMonth: Months.APRIL,
        isDefault: false,
        users: [],
      };

      const location = {
        id: 1,
        name: 'New York Office',
        workWeek: [WeekStartOptions.MONDAY, WeekStartOptions.THURSDAY],
        weekStartsOn: WeekStartOptions.MONDAY,
        leaveQuotaResetBasedOn: LeaveQuotaResetOptions.ACCOUNTING_YEAR,
        timeZone: 'America/New_York',
        fiscalYearStartMonth: Months.APRIL,
        isDefault: false,
      };

      jest.spyOn(locationService, 'createLocation').mockResolvedValue(location);
      jest
        .spyOn(i18nService, 't')
        .mockReturnValue('Location created successfully');

      // Await the controller method
      const result = await controller.createLocation(createLocationDto);

      // Check the expected result
      expect(result.code).toEqual(HttpStatus.CREATED);

      // Verify the service method was called correctly
      expect(locationService.createLocation).toHaveBeenCalledWith(createLocationDto);
    });
  });

  describe('getAllLocations', () => {
    it('should return all locations', async () => {
      const queryParams = { page: 1, limit: 10 };
      const docs = [];
      const meta = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        hasMore: false,
      };
      jest.spyOn(locationService, 'getAllLocations').mockResolvedValue({ docs, meta });
      jest
        .spyOn(i18nService, 't')
        .mockReturnValue('Locations retrieved successfully');

      const result = await controller.getAllLocations(queryParams);
      expect(result).toEqual(
        new SuccessResponsePaginate(
          'Locations retrieved successfully',
          docs,
          meta
        )
      );
    });
  });

  describe('getOneLocation', () => {
    it('should return a location by ID', async () => {
      const id = '1';
      const location: any = {
        id,
        name: 'New York Office',
        workWeek: [WeekStartOptions.MONDAY, WeekStartOptions.THURSDAY],
        weekStartsOn: WeekStartOptions.MONDAY,
        leaveQuotaResetBasedOn: LeaveQuotaResetOptions.ACCOUNTING_YEAR,
        timeZone: 'America/New_York',
        fiscalYearStartMonth: Months.APRIL,
        isDefault: false,
        users: [],
      };
      jest.spyOn(locationService, 'getOneLocation').mockResolvedValue(location);
      jest
        .spyOn(i18nService, 't')
        .mockReturnValue('Location retrieved successfully');

      const result = await controller.getOneLocation(id);
      expect(result).toEqual(
        new SuccessResponse('Location retrieved successfully', location)
      );
    });
  });

  describe('updateLocation', () => {
    it('should update a location', async () => {
      const id = '1';
      const updateLocationDto: UpdateLocationDto = {
        name: 'New York Office',
        workWeek: [WeekStartOptions.MONDAY, WeekStartOptions.THURSDAY],
        weekStartsOn: WeekStartOptions.MONDAY,
        leaveQuotaResetBasedOn: LeaveQuotaResetOptions.ACCOUNTING_YEAR,
        timeZone: 'America/New_York',
        fiscalYearStartMonth: Months.APRIL,
        isDefault: false,
      };
      const updatedLocation = { id, ...updateLocationDto };
      jest.spyOn(locationService, 'updateLocation').mockResolvedValue(updatedLocation);
      jest
        .spyOn(i18nService, 't')
        .mockReturnValue('Location updated successfully');

      const result = await controller.updateLocation(id, updateLocationDto);
      expect(result).toEqual(
        new SuccessResponse('Location updated successfully', updatedLocation)
      );
    });
  });

  describe('deleteLocation', () => {
    it('should delete a location', async () => {
      const id = '1';
      const deletedLocation: any = {
        id,
        name: 'New York Office',
        workWeek: [WeekStartOptions.MONDAY, WeekStartOptions.THURSDAY],
        weekStartsOn: WeekStartOptions.MONDAY,
        leaveQuotaResetBasedOn: LeaveQuotaResetOptions.ACCOUNTING_YEAR,
        timeZone: 'America/New_York',
        fiscalYearStartMonth: Months.APRIL,
        isDefault: false,
      };
      jest.spyOn(locationService, 'deleteLocation').mockResolvedValue(deletedLocation);
      jest
        .spyOn(i18nService, 't')
        .mockReturnValue('Location deleted successfully');

      const result = await controller.deleteLocation(id);
      expect(result).toEqual(
        new SuccessMsgResponse('Location deleted successfully')
      );
    });
  });
});
