import { Injectable } from '@nestjs/common';
import { CreateLeaveTypeDepartmentDto } from './dto/createLeaveTypeDepartment.dto';
import { UpdateLeaveTypeDepartmentDto } from './dto/updateLeaveTypeDepartment.dto';
import { I18nService } from 'nestjs-i18n';
import {
  BadRequestException,
  NotFoundException,
} from '../../common/exceptions/application.exceptions';
import { LeaveTypeDepartmentRepository } from './leaveTypeDepartments.repository';
import { QueryParams } from '../../common/dto/pagination.dto';
import { BaseService } from '../../common/helpers/baseService.helper';

@Injectable()
export class LeaveTypeDepartmentsService extends BaseService {
  constructor(
    private readonly leaveTypeDepartmentsRepository: LeaveTypeDepartmentRepository,
    private readonly i18n: I18nService
  ) {
    super();
  }
  async createLeaveTypeDepartments(
    createLeaveTypeDepartmentDto: CreateLeaveTypeDepartmentDto[]
  ) {
    const existingLeaveTypeDepartments =
      await this.leaveTypeDepartmentsRepository.findAllLeaveTypeDepartmentsExist(
        createLeaveTypeDepartmentDto
      );
    if (
      existingLeaveTypeDepartments.length > 0 &&
      existingLeaveTypeDepartments.length == CreateLeaveTypeDepartmentDto.length
    )
      throw new BadRequestException(
        this.i18n,
        'leaveTypeDepartments',
        'create.alreadyExists'
      );
    return await this.leaveTypeDepartmentsRepository.createLeaveTypeDepartments(
      createLeaveTypeDepartmentDto
    );
  }

  async getAllLeaveTypeDepartmentByLeaveTypeId(
    leaveTypeId: string,
    queryParams: QueryParams
  ) {

    return this.getPaginatedData(
      queryParams,
      this.leaveTypeDepartmentsRepository.findAllLeaveTypeDepartments.bind(
        this.leaveTypeDepartmentsRepository
      ),
      [leaveTypeId]
    );
  }

  async getAllLeaveTypeDepartmentsExist(
    leaveTypeDepartment: CreateLeaveTypeDepartmentDto[]
  ) {
    return await this.leaveTypeDepartmentsRepository.findAllLeaveTypeDepartmentsExist(
      leaveTypeDepartment
    );
  }

  async getOneLeaveTypeDepartment(leaveTypeId: string, departmentId: string) {
    const leaveTypeDepartment =
      await this.leaveTypeDepartmentsRepository.findLeaveTypeDepartmentByObj({
        leaveTypeId,
        departmentId,
      });
    if (!leaveTypeDepartment)
      throw new NotFoundException(
        this.i18n,
        'leaveTypeDepartments',
        `${leaveTypeId} , ${departmentId}`
      );
    return leaveTypeDepartment;
  }

  async updateLeaveTypeDepartment(
    leaveTypeId: string,
    departmentId: string,
    updateLeaveTypeDepartmentDto: UpdateLeaveTypeDepartmentDto
  ) {
    const leaveTypeDepartment =
      await this.leaveTypeDepartmentsRepository.findLeaveTypeDepartmentByObj({
        leaveTypeId,
        departmentId,
      });
    if (!leaveTypeDepartment)
      throw new NotFoundException(
        this.i18n,
        'leaveTypeDepartments',
        `${leaveTypeId} , ${departmentId}`
      );
    return await this.leaveTypeDepartmentsRepository.updateLeaveTypeDepartment(
      leaveTypeId,
      departmentId,
      updateLeaveTypeDepartmentDto
    );
  }

  async deleteLeaveTypeDepartment(leaveTypeId: string, departmentId: string) {
    const leaveTypeDepartment =
      await this.leaveTypeDepartmentsRepository.findLeaveTypeDepartmentByObj({
        leaveTypeId,
        departmentId,
      });
    if (!leaveTypeDepartment)
      throw new NotFoundException(
        this.i18n,
        'leaveTypeDepartments',
        `${leaveTypeId} , ${departmentId}`
      );
    await this.leaveTypeDepartmentsRepository.deleteLeaveTypeDepartment(
      leaveTypeId,
      departmentId
    );
    return leaveTypeDepartment;
  }
}
