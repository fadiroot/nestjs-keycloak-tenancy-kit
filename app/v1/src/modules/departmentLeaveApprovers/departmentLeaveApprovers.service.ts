import { Injectable } from '@nestjs/common';
import { CreateDepartmentLeaveApproverDto } from './dto/createDepartmentLeaveApprover.dto';
import { UpdateDepartmentLeaveApproverDto } from './dto/updateDepartmentLeaveAprover.dto';
import { DepartmentLeaveApproversRepository } from './departmentLeaveApprovers.repository';
import { I18nService } from 'nestjs-i18n';
import {
  BadRequestException,
  NotFoundException,
} from '../../common/exceptions/application.exceptions';
import { DEPARTMENT_LEAVE_APPROVERS_TRANSLATION_NAME } from './departmentLeaveApprovers.constants';
import { DepartmentLeaveApproverMapper } from './interfaces/departmentLeaveApprover.interface';
import { QueryParams } from '../../common/dto/pagination.dto';
import { BaseService } from '../../common/helpers/baseService.helper';

@Injectable()
export class DepartmentLeaveApproversService extends BaseService {
  constructor(
    private readonly departmentLeaveApproversRepository: DepartmentLeaveApproversRepository,
    private readonly i18n: I18nService
  ) {
    super();
  }
  async createDepartmentLeaveApprover(
    createDepartmentLeaveApproverDto: CreateDepartmentLeaveApproverDto[]
  ) {
    const departmentLeaveApprover =
      await this.departmentLeaveApproversRepository.findAllDepartmentLeaveApproversExist(
        createDepartmentLeaveApproverDto
      );

    if (
      departmentLeaveApprover.length == createDepartmentLeaveApproverDto.length
    )
      throw new BadRequestException(
        this.i18n,
        DEPARTMENT_LEAVE_APPROVERS_TRANSLATION_NAME,
        'create.alreadyExists'
      );
    const newDepartmentLeaveApprover =
      await this.departmentLeaveApproversRepository.createDepartmentLeaveApprover(
        createDepartmentLeaveApproverDto
      );
    return DepartmentLeaveApproverMapper.toDomain(newDepartmentLeaveApprover);
  }

  async getAllDepartmentLeaveApproversByDepartmentId(
    departmentId: string,
    queryParams: QueryParams
  ) {
    return await this.getPaginatedData(
      queryParams,
      this.departmentLeaveApproversRepository.findAllDepartmentLeaveApprovers.bind(
        this.departmentLeaveApproversRepository
      ),
      [departmentId]
    );
  }

  async getAllDepartmentLeaveApproversByDepartmentIdWithoutPagination(
    departmentId: string
  ) {
    const departmentLeaveApprover =
      await this.departmentLeaveApproversRepository.findAllDepartmentLeaveApproversByDepartmentId(
        departmentId
      );
    if (departmentLeaveApprover.length == 0)
      throw new NotFoundException(
        this.i18n,
        DEPARTMENT_LEAVE_APPROVERS_TRANSLATION_NAME,
        departmentId
      );
    return departmentLeaveApprover;
  }

  async getAllDepartmentLeaveApprovers(
    createDepartmentLeaveApproverDto: CreateDepartmentLeaveApproverDto[]
  ) {
    return await this.departmentLeaveApproversRepository.findAllDepartmentLeaveApproversExist(
      createDepartmentLeaveApproverDto
    );
  }
  async getOneDepartmentLeaveApprover(departmentId: string, userId: string) {
    const departmentLeaveApprover =
      await this.departmentLeaveApproversRepository.findDepartmentLeaveApproverByObj(
        { departmentId, userId } as CreateDepartmentLeaveApproverDto
      );
    if (!departmentLeaveApprover)
      throw new NotFoundException(
        this.i18n,
        DEPARTMENT_LEAVE_APPROVERS_TRANSLATION_NAME,
        departmentId + ',' + userId
      );
    return departmentLeaveApprover;
  }

  async updateDepartmentLeaveApprover(
    departmentId: string,
    userId: string,
    updateDepartmentLeaveApproverDto: UpdateDepartmentLeaveApproverDto
  ) {
    const departmentLeaveApprover =
      await this.departmentLeaveApproversRepository.findDepartmentLeaveApproverByObj(
        { departmentId, userId }
      );
    if (!departmentLeaveApprover)
      throw new NotFoundException(
        this.i18n,
        DEPARTMENT_LEAVE_APPROVERS_TRANSLATION_NAME,
        departmentId + ',' + userId
      );
    return await this.departmentLeaveApproversRepository.updateDepartmentLeaveApprover(
      departmentId,
      userId,
      updateDepartmentLeaveApproverDto
    );
  }

  async deleteDepartmentLeaveApprover(departmentId: string, userId: string) {
    const departmentLeaveApprover =
      await this.departmentLeaveApproversRepository.findDepartmentLeaveApproverByObj(
        { departmentId, userId }
      );
    if (!departmentLeaveApprover)
      throw new NotFoundException(
        this.i18n,
        DEPARTMENT_LEAVE_APPROVERS_TRANSLATION_NAME,
        departmentId + ',' + userId
      );
    await this.departmentLeaveApproversRepository.deleteDepartmentLeaveApprover(
      departmentId,
      userId
    );
    return departmentLeaveApprover;
  }
}
