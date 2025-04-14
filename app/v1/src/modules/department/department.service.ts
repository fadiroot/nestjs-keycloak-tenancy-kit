import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/createDepartment.dto';
import { UpdateDepartmentDto } from './dto/updateDepartment.dto';
import { DepartmentRepository } from './department.repository';
import { I18nService } from 'nestjs-i18n';
import {
  BadRequestException,
  NotFoundException,
} from '../../common/exceptions/application.exceptions';
import { DEPARTMENT } from './department.constants';
import { UserService } from '../user/user.service';
import { DepartmentLeaveApproversService } from '../departmentLeaveApprovers/departmentLeaveApprovers.service';
import { CreateDepartmentLeaveApproverDto } from '../departmentLeaveApprovers/dto/createDepartmentLeaveApprover.dto';
import { validateEntityIds } from '../../common/utils/validation.utils';
import { QueryParams } from '../../common/dto/pagination.dto';
import { BaseService } from '../../common/helpers/baseService.helper';
import { TransactionManager } from '../../transaction/transactionManager';
import { DepartmentTable } from './interfaces/department.interfaces';

export interface CreateDepartmentTransaction {
  createDepartmentDto: CreateDepartmentDto;
  createDepartment?: DepartmentTable;
  assignUsers?: boolean;
  createDepartmentLeaveApprover?: boolean;
}

@Injectable()
export class DepartmentService extends BaseService {
  constructor(
    private readonly i18n: I18nService,
    private readonly departmentRepository: DepartmentRepository,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly departmentLeaveApproversService: DepartmentLeaveApproversService
  ) {
    super();
  }
  async findAllForStat() {
    return await this.departmentRepository.findAllForStat();
  }

  async createDepartment(createDepartmentDto: CreateDepartmentDto) {
    const transaction = new TransactionManager<CreateDepartmentTransaction>({
      createDepartmentDto,
    });
    const { name, users, approvers } = createDepartmentDto;

    const existingDepartment =
      await this.departmentRepository.findDepartmentByName(name);
    if (existingDepartment) {
      throw new BadRequestException(
        this.i18n,
        'Departments',
        'name.alreadyExists'
      );
    }

    if (approvers)
      await validateEntityIds(
        this.i18n,
        await this.userService.findAll(approvers),
        approvers,
        'Approvers'
      );
    if (users)
      await validateEntityIds(
        this.i18n,
        await this.userService.findAll(users),
        users,
        'Users'
      );

    transaction.addStep({
      name: 'createDepartment',
      execute: async (context) => {
        return await this.departmentRepository.createDepartment({
          name: context.createDepartmentDto.name,
          approverType: context.createDepartmentDto.approverType,
          isDefault: context.createDepartmentDto.isDefault,
        } as CreateDepartmentDto);
      },
      rollback: async (context) => {
        if (context.createDepartment) {
          await this.departmentRepository.deleteDepartment(
            context.createDepartment.id
          );
        }
      },
    });
    if (users)
      transaction.addStep({
        name: 'assignUsers',
        execute: async (context) => {
          await this.userService.updateUsersWithIds(
            { department_id: context.createDepartment.id },
            users
          );
        },
        rollback: async (context) => {
          if (context.assignUsers) {
            await this.userService.updateUsersWithIds(
              { department_id: null },
              users
            );
          }
        },
      });

    if (approvers)
      transaction.addStep({
        name: 'createDepartmentLeaveApprover',
        execute: async (context) => {
          const approverEntries = approvers.map(
            (userId) =>
              ({
                userId: userId,
                departmentId: context.createDepartment.id,
              }) as CreateDepartmentLeaveApproverDto
          );
          await this.departmentLeaveApproversService.createDepartmentLeaveApprover(
            approverEntries
          );
        },
        rollback: async (context) => {
          if (context.createDepartmentLeaveApprover) {
            approvers.map(async (userId) => {
              await this.departmentLeaveApproversService.deleteDepartmentLeaveApprover(
                context.createDepartment.id,
                userId
              );
            });
          }
        },
      });

    const result = await transaction.execute();
    return result.data.createDepartment;
  }

  async getAllDepartments(queryParams: QueryParams) {
    return await this.getPaginatedData(
      queryParams,
      this.departmentRepository.findAllDepartments.bind(
        this.departmentRepository
      )
    );
  }

  async getAllDepartmentsIds() {
    return await this.departmentRepository.findAllDepartmentsIds();
  }

  async getAllDepartmentsExists(ids: string[]) {
    return await this.departmentRepository.findAllDepartmentsExists(ids);
  }

  async getOneDepartment(id: string) {
    const department = await this.departmentRepository.findDepartmentById(id);
    if (!department) {
      throw new NotFoundException(this.i18n, DEPARTMENT, id);
    }
    return department;
  }

  async updateDepartment(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const { users, approvers, name, approverType, isDefault } =
      updateDepartmentDto;
    const department = await this.departmentRepository.findDepartmentById(id);
    if (!department) {
      throw new NotFoundException(this.i18n, DEPARTMENT, id);
    }

    if (users && users.length) {
      await validateEntityIds(
        this.i18n,
        await this.userService.findAll(),
        users,
        'Users'
      );
      await this.userService.updateUsersWithIds(
        { department_id: department.id },
        users
      );
    }

    if (approvers && approvers.length) {
      await validateEntityIds(
        this.i18n,
        await this.userService.findAll(approvers),
        approvers,
        'Approvers'
      );

      const approverEntries = approvers.map(
        (userId: string) =>
          ({
            userId: userId,
            departmentId: department.id as string,
          }) as CreateDepartmentLeaveApproverDto
      );
      const existingApprovers =
        await this.departmentLeaveApproversService.getAllDepartmentLeaveApprovers(
          approverEntries
        );
      if (existingApprovers.length != approvers.length) {
        let newApproverEntries;

        const approversToCreate = approvers.filter(
          (userId) =>
            !existingApprovers.some((approver) => approver.userId === userId)
        );
        if (approversToCreate.length > 0) {
          newApproverEntries = approversToCreate.map(
            (userId) =>
              ({
                userId: userId,
                departmentId: department.id,
              }) as CreateDepartmentLeaveApproverDto
          );
          await this.departmentLeaveApproversService.createDepartmentLeaveApprover(
            newApproverEntries
          );
        }
      }
    }
    if (name || approverType) {
      await this.departmentRepository.updateDepartment(id, {
        name,
        approverType,
        isDefault,
      });
    }
    return await this.departmentRepository.findDepartmentById(id);
  }
  async deleteDepartment(id: string) {
    const department = await this.departmentRepository.findDepartmentById(id);
    if (!department) {
      throw new NotFoundException(this.i18n, DEPARTMENT, id);
    }
    await this.departmentRepository.deleteDepartment(id);
    return department;
  }
}
