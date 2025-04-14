import { Injectable } from '@nestjs/common';
import { CreateLeaveTypeSpecialEmployeeDto } from './dto/createLeaveTypeSpecialEmployee.dto';
import { UpdateLeaveTypeSpecialEmployeeDto } from './dto/updateLeaveTypeSpecialEmployee.dto';
import { BaseService } from '../../common/helpers/baseService.helper';
import { I18nService } from 'nestjs-i18n/dist/services/i18n.service';
import { LeaveTypeSpecialEmployeesRepository } from './leaveTypeSpecialEmployees.repository';
import {
  BadRequestException,
  NotFoundException,
} from '../../common/exceptions/application.exceptions';
import { QueryParams } from '../../common/dto/pagination.dto';

@Injectable()
export class LeaveTypeSpecialEmployeesService extends BaseService {
  constructor(
    private readonly leaveTypeSpecialEmployeesRepository: LeaveTypeSpecialEmployeesRepository,
    private readonly i18n: I18nService
  ) {
    super();
  }

  async createLeaveTypeSpecialEmployees(
    createLeaveTypeSpecialEmployeeDto: CreateLeaveTypeSpecialEmployeeDto[]
  ) {
    const LeaveTypeSpecialEmployees =
      await this.leaveTypeSpecialEmployeesRepository.findAllLeaveTypeSpecialEmployeesExist(
        createLeaveTypeSpecialEmployeeDto
      );
    if (
      LeaveTypeSpecialEmployees > 0 &&
      LeaveTypeSpecialEmployees.length ==
        createLeaveTypeSpecialEmployeeDto.length
    )
      throw new BadRequestException(
        this.i18n,
        'leaveTypeSpecialEmployees',
        'create.alreadyExists'
      );
    return await this.leaveTypeSpecialEmployeesRepository.createLeaveTypeSpecialEmployees(
      createLeaveTypeSpecialEmployeeDto
    );
  }
  async getAllLeaveTypeSpecialEmployeesByLeaveTypeId(
    leaveTypeId: string,
    queryParams: QueryParams
  ) {
    return this.getPaginatedData(
      queryParams,
      this.leaveTypeSpecialEmployeesRepository.findAllLeaveTypeSpecialEmployees.bind(
        this.leaveTypeSpecialEmployeesRepository
      ),
      [leaveTypeId]
    );
  }

  async getAllLeaveTypeSpecialEmployeesExist(
    leaveTypeSpecialEmployee: CreateLeaveTypeSpecialEmployeeDto[]
  ) {
    return await this.leaveTypeSpecialEmployeesRepository.findAllLeaveTypeSpecialEmployeesExist(
      leaveTypeSpecialEmployee
    );
  }

  async getOneLeaveTypeSpecialEmployee(leaveTypeId: string, userId: string) {
    const leaveTypeSpecialEmployee =
      await this.leaveTypeSpecialEmployeesRepository.findLeaveTypeSpecialEmployeeByObj(
        {
          leaveTypeId,
          userId,
        }
      );
    if (!leaveTypeSpecialEmployee)
      throw new NotFoundException(
        this.i18n,
        'leaveTypeSpecialEmployees',
        `${leaveTypeId} , ${userId}`
      );
    return leaveTypeSpecialEmployee;
  }

  async updateLeaveTypeSpecialEmployee(
    leaveTypeId: string,
    userId: string,
    updateLeaveTypeSpecialEmployeeDto: UpdateLeaveTypeSpecialEmployeeDto
  ) {
    const leaveTypeSpecialEmployee =
      await this.leaveTypeSpecialEmployeesRepository.findLeaveTypeSpecialEmployeeByObj(
        {
          leaveTypeId,
          userId,
        }
      );
    if (!leaveTypeSpecialEmployee)
      throw new NotFoundException(
        this.i18n,
        'leaveTypeSpecialEmployees',
        `${leaveTypeId} , ${userId}`
      );
    return await this.leaveTypeSpecialEmployeesRepository.updateLeaveTypeSpecialEmployee(
      leaveTypeId,
      userId,
      updateLeaveTypeSpecialEmployeeDto
    );
  }

  async deleteLeaveTypeSpecialEmployee(leaveTypeId: string, userId: string) {
    const leaveTypeSpecialEmployee =
      await this.leaveTypeSpecialEmployeesRepository.findLeaveTypeSpecialEmployeeByObj(
        {
          leaveTypeId,
          userId,
        }
      );
    if (!leaveTypeSpecialEmployee)
      throw new NotFoundException(
        this.i18n,
        'leaveTypeSpecialEmployees',
        `${leaveTypeId} , ${userId}`
      );
    await this.leaveTypeSpecialEmployeesRepository.deleteLeaveTypeSpecialEmployee(
      leaveTypeId,
      userId
    );
    return leaveTypeSpecialEmployee;
  }
}
