import { Injectable } from '@nestjs/common';
import { UpdateLeaveDto } from './dto/updateLeave.dto';
import { LeaveRepository } from './leave.repository';
import { I18nService } from 'nestjs-i18n';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '../../common/exceptions/application.exceptions';
import { LEAVE_PATH, LEAVE_TABLE } from './leave.constants';
import { RequestLeaveUserDto } from './dto/requestLeaveUser.dto';
import {
  IUserRequest,
  UserDomain,
  UserMapper,
} from '../user/interfaces/user.interface';
import { LeaveStatus } from './interfaces/leave.interfaces';
import { BaseService } from '../../common/helpers/baseService.helper';
import { QueryParams } from '../../common/dto/pagination.dto';
import { LEAVE_TYPE_PATH } from '../leaveTypes/leaveTypes.constants';
import { LeaveTypesService } from '../leaveTypes/leaveTypes.service';
import { UpdateStatusLeave } from './dto/updateStatusLeave.dto';
import { AssignToType } from '../leaveTypes/enums/leaveTypes.enum';
import { LeaveTypeDepartmentsService } from '../leaveTypeDepartments/leaveTypeDepartments.service';
import { DepartmentLeaveApproversService } from '../departmentLeaveApprovers/departmentLeaveApprovers.service';
import { LeaveTypeSpecialEmployeesService } from '../leaveTypeSpecialEmployees/leavetypeSpecialEmployees.service';
import { DepartmentService } from '../department/department.service';
import { ApproverType } from '../department/enums/department.enum';
import { LeaveApprovalsService } from '../leaveApprovals/leaveApprovals.service';
import { UserService } from '../user/user.service';
import { DropboxService } from '../dropbox/dropbox.service';
import { UploadedFileService } from '../uploadedFiles/uploadedFile.service';

@Injectable()
export class LeaveService extends BaseService {
  constructor(
    private readonly i18n: I18nService,
    private readonly leaveRepository: LeaveRepository,
    private readonly leaveTypesService: LeaveTypesService,
    private readonly leaveTypeDepartmentsService: LeaveTypeDepartmentsService,
    private readonly leaveTypeSpecialEmployeesService: LeaveTypeSpecialEmployeesService,
    private readonly departmentLeaveApproversService: DepartmentLeaveApproversService,
    private readonly departmentService: DepartmentService,
    private readonly leaveApprovalsService: LeaveApprovalsService,
    private readonly userService: UserService,
    private readonly dropboxService: DropboxService,
    private readonly uploadedFilesService: UploadedFileService
  ) {
    super();
  }

  async createLeave(createLeaveDto: any, user: IUserRequest['user']) {
    const leaveType = await this.leaveTypesService.getOneLeaveType(
      createLeaveDto.leaveTypeId
    );
    if (createLeaveDto.startDate && createLeaveDto?.endDate) {
      const leaveDuration = this.getDaysBetweenDates(
        createLeaveDto.startDate,
        createLeaveDto.endDate,
        leaveType.subtractWeekends
      );
      if (!leaveType.allowNegativeBalance && user.leaveBalance <= leaveDuration)
        throw new BadRequestException(
          this.i18n,
          LEAVE_PATH,
          'create.error.InvalidLeaveDuration'
        );
    }
    if (leaveType) {
      if (leaveType.assignToType === AssignToType.DEPARTMENTS) {
        const leaveTypeDepartment =
          await this.leaveTypeDepartmentsService.getOneLeaveTypeDepartment(
            leaveType.id,
            user.departmentId
          );
        if (leaveTypeDepartment) {
          await this.departmentLeaveApproversService.getAllDepartmentLeaveApproversByDepartmentIdWithoutPagination(
            leaveTypeDepartment.departmentId
          );
        }
      } else {
        const leaveTypeSpecialEmployees =
          await this.leaveTypeSpecialEmployeesService.getOneLeaveTypeSpecialEmployee(
            leaveType.id,
            user.id
          );
        if (leaveTypeSpecialEmployees) {
          await this.departmentLeaveApproversService.getAllDepartmentLeaveApproversByDepartmentIdWithoutPagination(
            user.departmentId
          );
        }
      }

      let attachmentUrls: string[] = [];
      if (
        createLeaveDto?.attachments &&
        createLeaveDto?.attachments.length > 0
      ) {
        attachmentUrls = await this.dropboxService.uploadFile(
          createLeaveDto?.attachments[0]
        );
      }

      const { attachments, ...leaveDetails } = createLeaveDto;
      const createdLeave = await this.leaveRepository.createLeave(leaveDetails);

      if (attachmentUrls.length > 0) {
        const attachments = attachmentUrls.map((url) => ({
          entityId: createdLeave.id,
          entityType: LEAVE_TABLE,
          fileUrl: url,
        }));
        await this.uploadedFilesService.insertUploadedFilesUrls(attachments);
      }
      return createdLeave;
    }
  }

  async getAllLeavesByEmployee(userId: string, queryParams: QueryParams) {
    return await this.getPaginatedData(
      queryParams,
      this.leaveRepository.findAllLeaves.bind(this.leaveRepository),
      [userId]
    );
  }

  async getAllLeavesByApprover(userId: string, queryParams: QueryParams) {
    return await this.getPaginatedData(
      queryParams,
      this.leaveRepository.findAllLeavesByApprover.bind(this.leaveRepository),
      [userId]
    );
  }

  async getOneLeave(id: string) {
    const leave = await this.leaveRepository.findLeaveById(id);
    if (!leave) {
      throw new NotFoundException(this.i18n, LEAVE_PATH, id);
    }
    return leave;
  }

  async updateLeave(
    id: string,
    updateLeaveDto: UpdateLeaveDto | UpdateStatusLeave,
    user?: typeof UserMapper.DomainType
  ) {
    const userId = user.id;
    let leave = await this.leaveRepository.findLeaveById(id);
    if (!leave) {
      throw new NotFoundException(this.i18n, LEAVE_PATH, id);
    }

    if (leave.status == LeaveStatus.PENDING && leave.userId == userId) {
      if (
        'startDate' in updateLeaveDto &&
        'endDate' in updateLeaveDto &&
        updateLeaveDto.startDate &&
        updateLeaveDto?.endDate
      ) {
        const leaveDuration = this.getDaysBetweenDates(
          updateLeaveDto.startDate,
          updateLeaveDto.endDate,
          leave.leaveType.subtractWeekends
        );
        if (
          !leave.leaveType.allowNegativeBalance &&
          leave.leaveBalance >= leaveDuration
        )
          throw new BadRequestException(
            this.i18n,
            LEAVE_PATH,
            'update.error.InvalidLeaveDuration'
          );
      }
      return this.leaveRepository.updateLeave(leave.id, updateLeaveDto);
    }
    if (userId) {
      const hasAccess = await this.leaveRepository.hasAccess(leave, userId);
      if (hasAccess == 0)
        throw new ForbiddenException(this.i18n, LEAVE_PATH, 'update', { id });
    }
    const department = await this.departmentService.getOneDepartment(
      leave.user.departmentId
    );
    const leaveDuration = this.getDaysBetweenDates(
      leave.startDate,
      leave.endDate,
      leave.leaveType.subtractWeekends
    );
    if (department.approverType == ApproverType.SPECIFIC) {
      leave = await this.leaveRepository.updateLeave(id, updateLeaveDto);
      await this.leaveApprovalsService.createLeaveApproval({
        leaveId: leave.id,
        approverId: userId,
        status: leave.status,
        reason: 'reason' in updateLeaveDto ? updateLeaveDto?.reason : undefined,
      });

      if (leave.status == LeaveStatus.APPROVED)
        await this.userService.update(leave.userId, {
          leaveBalance: leaveDuration - user.leaveBalance,
        });
      return leave;
    }
    const approvers =
      await this.departmentLeaveApproversService.getAllDepartmentLeaveApproversByDepartmentIdWithoutPagination(
        department.id
      );
    const leaveApprovers =
      await this.leaveApprovalsService.getAllLeaveApprovalsWithoutPagination(
        leave.id
      );

    if (leaveApprovers.length == 0 && approvers.length > 1) {
      await this.leaveApprovalsService.createLeaveApproval({
        leaveId: leave.id,
        approverId: userId,
        status: leave.status,
        reason: 'reason' in updateLeaveDto ? updateLeaveDto?.reason : undefined,
      });
      return await this.leaveRepository.updateLeave(leave.id, {
        status:
          leave.status == LeaveStatus.APPROVED
            ? LeaveStatus.PART_APPROVED
            : leave.status,
      });
    } else if (leaveApprovers.length == 0 && approvers.length == 1) {
      await this.leaveApprovalsService.createLeaveApproval({
        leaveId: leave.id,
        approverId: userId,
        status: leave.status,
        reason: 'reason' in updateLeaveDto ? updateLeaveDto?.reason : undefined,
      });
      if (leave.status == LeaveStatus.APPROVED)
        await this.userService.update(leave.userId, {
          leaveBalance: leaveDuration - user.leaveBalance,
        });
      return await this.leaveRepository.updateLeave(leave.id, {
        status:
          'status' in updateLeaveDto ? updateLeaveDto?.status : leave.status,
      });
    } else if (leaveApprovers.length == approvers.length) {
      return leave;
    } else if (
      leaveApprovers.length > 0 &&
      leaveApprovers.length < approvers.length
    ) {
      if (leaveApprovers.length == approvers.length - 1) {
        await this.leaveApprovalsService.createLeaveApproval({
          leaveId: leave.id,
          approverId: userId,
          status: leave.status,
          reason:
            'reason' in updateLeaveDto ? updateLeaveDto?.reason : undefined,
        });
        if (leave.status == LeaveStatus.APPROVED)
          await this.userService.update(leave.userId, {
            leaveBalance: leaveDuration - user.leaveBalance,
          });
        return await this.leaveRepository.updateLeave(leave.id, {
          status: leave.status,
        });
      } else {
        await this.leaveApprovalsService.createLeaveApproval({
          leaveId: leave.id,
          approverId: userId,
          status: leave.status,
          reason:
            'reason' in updateLeaveDto ? updateLeaveDto?.reason : undefined,
        });
        return await this.leaveRepository.updateLeave(leave.id, {
          status:
            leave.status == LeaveStatus.APPROVED
              ? LeaveStatus.PART_APPROVED
              : leave.status,
        });
      }
    }
    return leave;
  }

  async deleteLeave(id: string) {
    const leave = await this.leaveRepository.findLeaveById(id);
    if (!leave) {
      throw new NotFoundException(this.i18n, LEAVE_PATH, id);
    }
    await this.leaveRepository.deleteLeave(id);
    return leave;
  }

  private getDaysBetweenDates(
    startDate: Date | string,
    endDate: Date | string,
    subtract_weekends: boolean
  ): number {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);

    if (isNaN(start.getTime())) {
      throw new BadRequestException(this.i18n, 'leaves', 'startDate.invalid');
    }
    if (isNaN(end.getTime())) {
      throw new BadRequestException(this.i18n, 'leaves', 'endDate.invalid');
    }

    if (!subtract_weekends) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    let count = 0;
    const currentDate = new Date(Math.min(start.getTime(), end.getTime()));
    const lastDate = new Date(Math.max(start.getTime(), end.getTime()));

    while (currentDate <= lastDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
  }

  async requestLeaveUser(
    requestLeaveUserDto: RequestLeaveUserDto,
    user: UserDomain
  ) {
    const { leaveTypeId, startDate, endDate, comment } = requestLeaveUserDto;

    const leaveType = await this.leaveTypesService.getOneLeaveType(leaveTypeId);

    if (leaveType.reason_required && !comment) {
      throw new NotFoundException(this.i18n, LEAVE_TYPE_PATH, leaveTypeId);
    }

    if (leaveType) {
      if (leaveType.assignToType === AssignToType.DEPARTMENTS) {
        const leaveTypeDepartment =
          await this.leaveTypeDepartmentsService.getOneLeaveTypeDepartment(
            leaveType.id,
            user.departmentId
          );
        if (leaveTypeDepartment) {
          await this.departmentLeaveApproversService.getAllDepartmentLeaveApproversByDepartmentIdWithoutPagination(
            leaveTypeDepartment.departmentId
          );
        }
      } else {
        const leaveTypeSpecialEmployees =
          await this.leaveTypeSpecialEmployeesService.getOneLeaveTypeSpecialEmployee(
            leaveType.id,
            user.id
          );
        if (leaveTypeSpecialEmployees) {
          await this.departmentLeaveApproversService.getAllDepartmentLeaveApproversByDepartmentIdWithoutPagination(
            user.departmentId
          );
        }
      }
    }

    const leaveDuration = this.getDaysBetweenDates(
      startDate,
      endDate,
      leaveType.subtract_weekends
    );

    if (
      user.leaveBalance < leaveDuration &&
      leaveType.allow_negative_balance === false
    ) {
      throw new NotFoundException(this.i18n, LEAVE_TYPE_PATH, leaveTypeId);
    }

    return await this.leaveRepository.createLeave({
      userId: user.id,
      leaveTypeId,
      startDate,
      endDate,
      comment,
      status: LeaveStatus.PENDING,
    });
  }
}
