import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { QueryParams } from '../../common/dto/pagination.dto';
import { BaseService } from '../../common/helpers/baseService.helper';
import { validateEntityIds } from '../../common/utils/validation.utils';
import { DepartmentService } from '../department/department.service';
import { LeaveTypeDepartmentsService } from '../leaveTypeDepartments/leaveTypeDepartments.service';
import { LeaveTypeLocationsService } from '../leaveTypeLocations/leaveTypeLocations.service';
import { LocationService } from '../location/location.service';
import { UserService } from '../user/user.service';
import { LEAVE_TYPE_PATH, LEAVE_TYPE_TABLE } from './leaveTypes.constants';
import { LeaveTypesRepository } from './leaveTypes.repository';
import {
  BadRequestException,
  NotFoundException,
} from '../../common/exceptions/application.exceptions';
import { LeaveTypeSpecialEmployeesService } from '../leaveTypeSpecialEmployees/leavetypeSpecialEmployees.service';

@Injectable()
export class LeaveTypesService extends BaseService {
  constructor(
    private readonly leaveTypesRepository: LeaveTypesRepository,
    private readonly userService: UserService,
    private readonly locationService: LocationService,
    private readonly departmentService: DepartmentService,
    private readonly leaveTypeDepartmentsService: LeaveTypeDepartmentsService,
    private readonly leaveTypeLocationsService: LeaveTypeLocationsService,
    private readonly leaveTypeSpecialEmployeesService: LeaveTypeSpecialEmployeesService,
    private readonly i18n: I18nService
  ) {
    super();
  }

  async createLeaveType(createLeaveTypeDto) {
    let { departments, locations, employees, ...filteredCreateDto } =
      createLeaveTypeDto;
    const existingLeaveType =
      await this.leaveTypesRepository.findLeaveTypeByObj(
        'name',
        '=',
        createLeaveTypeDto.name
      );
    if (existingLeaveType)
      throw new BadRequestException(
        this.i18n,
        'leaveTypes',
        'name.alreadyExists'
      );

    if (departments)
      if (departments.includes('all')) {
        (filteredCreateDto.isAllDepartments = true),
          (departments = await this.departmentService.getAllDepartmentsIds());
      } else {
        await validateEntityIds(
          this.i18n,
          await this.departmentService.getAllDepartmentsExists(departments),
          departments,
          'Departments'
        ),
          (filteredCreateDto.isAllDepartments = false);
      }
    if (employees)
      await validateEntityIds(
        this.i18n,
        await this.userService.findAll(employees),
        employees,
        'Special employees'
      );

    const leaveType =
      await this.leaveTypesRepository.createLeaveType(filteredCreateDto);
    if (!leaveType)
      throw new BadRequestException(
        this.i18n,
        LEAVE_TYPE_PATH,
        'name.alreadyExist'
      );

    if (locations) {
      const LocationEntries = locations.map((locationId) => ({
        locationId,
        leaveTypeId: leaveType.id,
      }));
      await this.leaveTypeLocationsService.createLeaveTypeLocations(
        LocationEntries
      );
    }
    if (departments) {
      const DepartmentEntries = departments.map((departmentId) => ({
        departmentId,
        leaveTypeId: leaveType.id,
      }));
      await this.leaveTypeDepartmentsService.createLeaveTypeDepartments(
        DepartmentEntries
      );
    }

    if (employees) {
      const employeeEntries = employees.map((userId) => ({
        userId,
        leaveTypeId: leaveType.id,
      }));
      await this.leaveTypeSpecialEmployeesService.createLeaveTypeSpecialEmployees(
        employeeEntries
      );
    }
    return leaveType;
  }

  async getAllLeaveTypes(queryParams: QueryParams) {
    return await this.getPaginatedData(
      queryParams,
      this.leaveTypesRepository.findAllLeaveTypes.bind(
        this.leaveTypesRepository
      )
    );
  }

  async getOneLeaveType(id: string) {
    const leaveType = await this.leaveTypesRepository.findLeaveTypeById(id);
    if (!leaveType) {
      throw new NotFoundException(this.i18n, LEAVE_TYPE_TABLE, id);
    }
    return leaveType;
  }

  async updateLeaveType(id: string, updateLeaveTypeDto) {
    let { locations, departments, employees, ...filteredUpdateDto } =
      updateLeaveTypeDto;
    const existingLeaveType =
      await this.leaveTypesRepository.findLeaveTypeById(id);
    if (!existingLeaveType)
      throw new NotFoundException(this.i18n, LEAVE_TYPE_TABLE, id);

    if (locations && locations.length) {
      if (locations.includes('all')) {
        (filteredUpdateDto.isAllLocations = true),
          (locations = await this.locationService.getAllLocationsIds());
      } else {
        (filteredUpdateDto.isAllLocations = false),
          await validateEntityIds(
            this.i18n,
            await this.locationService.getAllLocationsExists(locations),
            locations,
            'Locations'
          );
      }

      const LocationEntries = locations.map((locationId) => ({
        locationId,
        leaveTypeId: existingLeaveType.id,
      }));

      const existingLeaveTypeLocations =
        await this.leaveTypeLocationsService.getAllLeaveTypeLocationsExist(
          LocationEntries
        );
      let leaveTypeLocationsToCreate;

      if (locations.length != existingLeaveTypeLocations.length) {
        leaveTypeLocationsToCreate = locations.filter(
          (locationId) =>
            !existingLeaveTypeLocations.some(
              (location) => location.locationId === locationId
            )
        );
        if (leaveTypeLocationsToCreate.length > 0) {
          let newLeaveTypeLocations = leaveTypeLocationsToCreate.map(
            (locationId: string) => ({
              locationId: locationId,
              leaveTypeId: existingLeaveType.id as string,
            })
          );
          await this.leaveTypeLocationsService.createLeaveTypeLocations(
            newLeaveTypeLocations
          );
        }
      }
    }

    if (departments && departments.length) {
      if (departments.includes('all')) {
        (filteredUpdateDto.isAllDepartments = true),
          (departments = await this.departmentService.getAllDepartmentsIds());
      } else {
        (filteredUpdateDto.isAllDepartments = false),
          await validateEntityIds(
            this.i18n,
            await this.departmentService.getAllDepartmentsExists(departments),
            departments,
            'Departments'
          );
      }
      const DepartmentEntries = departments.map((departmentId) => ({
        departmentId,
        leaveTypeId: existingLeaveType.id,
      }));
      const existingLeaveTypeDepartments =
        await this.leaveTypeDepartmentsService.getAllLeaveTypeDepartmentsExist(
          DepartmentEntries
        );
      let leaveTypeDepartmentsToCreate;
      if (departments.length != existingLeaveTypeDepartments.length) {
        leaveTypeDepartmentsToCreate = departments.filter(
          (departmentId) =>
            !existingLeaveTypeDepartments.some(
              (department) => department.departmentId === departmentId
            )
        );
        if (leaveTypeDepartmentsToCreate.length > 0) {
          let newLeaveTypeDepartments = leaveTypeDepartmentsToCreate.map(
            (departmentId: string) => ({
              departmentId: departmentId,
              leaveTypeId: existingLeaveType.id as string,
            })
          );
          await this.leaveTypeDepartmentsService.createLeaveTypeDepartments(
            newLeaveTypeDepartments
          );
        }
      }
    }

    if (employees && employees.length) {
      // valid ids of users
      await validateEntityIds(
        this.i18n,
        await this.userService.findAll(employees),
        employees,
        'Special employees'
      );

      const employeeEntries = employees.map((userId: string) => ({
        userId: userId,
        leaveTypeId: existingLeaveType.id as string,
      }));
      const existingEmployees =
        await this.leaveTypeSpecialEmployeesService.getAllLeaveTypeSpecialEmployeesExist(
          employeeEntries
        );
      let leaveTypeEmployeesToCreate;
      if (existingEmployees.length != employees.length) {
        leaveTypeEmployeesToCreate = employees.filter(
          (userId) =>
            !existingEmployees.some((employee) => employee.userId === userId)
        );
      }
      if (leaveTypeEmployeesToCreate.length > 0) {
        let newLeaveTypeEmployees = leaveTypeEmployeesToCreate.map(
          (userId: string) => ({
            userId: userId,
            leaveTypeId: existingLeaveType.id as string,
          })
        );
        await this.leaveTypeSpecialEmployeesService.createLeaveTypeSpecialEmployees(
          newLeaveTypeEmployees
        );
      }
    }

    if (Object.keys(filteredUpdateDto).length > 0) {
      if (filteredUpdateDto.name) {
        const existingLeaveType =
          await this.leaveTypesRepository.findLeaveTypeByObj(
            'name',
            '=',
            filteredUpdateDto.name
          );
        if (existingLeaveType)
          throw new BadRequestException(
            this.i18n,
            'leaveTypes',
            'name.alreadyExists'
          );
      }
      return await this.leaveTypesRepository.updateLeaveType(
        id,
        filteredUpdateDto
      );
    } else return existingLeaveType;
  }

  async deleteLeaveType(id: string) {
    const leaveType = await this.leaveTypesRepository.findLeaveTypeById(id);
    if (!leaveType)
      throw new NotFoundException(this.i18n, LEAVE_TYPE_TABLE, id);

    if (leaveType.default)
      throw new BadRequestException(
        this.i18n,
        LEAVE_TYPE_TABLE,
        'delete.default'
      );
    await this.leaveTypesRepository.deleteLeaveType(id);
    if (!leaveType)
      throw new NotFoundException(this.i18n, LEAVE_TYPE_TABLE, id);

    return leaveType;
  }
}
