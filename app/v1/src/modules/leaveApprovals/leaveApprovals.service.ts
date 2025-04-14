import { Injectable } from '@nestjs/common';
import { CreateLeaveApprovalDto } from './dto/createLeaveApproval.dto';
import { UpdateLeaveApprovalDto } from './dto/updateLeaveApproval.dto';
import { I18nService } from 'nestjs-i18n';
import { LeaveApprovalsRepository } from './leaveApprovals.repository';
import { BaseService } from '../../common/helpers/baseService.helper';
import { QueryParams } from '../../common/dto/pagination.dto';
import {
  BadRequestException,
  NotFoundException,
} from '../../common/exceptions/application.exceptions';
import { LEAVE_APPROVALS } from './leaveApprovals.constants';

@Injectable()
export class LeaveApprovalsService extends BaseService {
  constructor(
    private readonly i18n: I18nService,
    private readonly leaveApprovalsRepository: LeaveApprovalsRepository
  ) {
    super();
  }
  async createLeaveApproval(createLeaveApprovalDto: CreateLeaveApprovalDto) {
    const { leaveId, approverId } = createLeaveApprovalDto;
    const existLeaveApprover =
      await this.leaveApprovalsRepository.findLeaveApproval(
        leaveId,
        approverId
      );
    if (existLeaveApprover)
      throw new BadRequestException(
        this.i18n,
        LEAVE_APPROVALS,
        'create.alreadyExist'
      );
    const leaveApproval =
      await this.leaveApprovalsRepository.createLeaveApproval(
        createLeaveApprovalDto
      );
    return leaveApproval;
  }

  async getAllLeaveApprovals(leaveId: string, QueryParams: QueryParams) {
    return await this.getPaginatedData(
      QueryParams,
      this.leaveApprovalsRepository.findAllLeaveApprovalsByLeaveId.bind(
        this.leaveApprovalsRepository
      ),
      [leaveId]
    );
  }

  async getAllLeaveApprovalsWithoutPagination(leaveId: string) {
    return await this.leaveApprovalsRepository.findAllLeaveApprovalsByLeaveIdWithoutPagination(
      leaveId
    );
  }

  async getOneLeaveApproval(leaveId: string, approverId: string) {
    const leaveApproval = await this.leaveApprovalsRepository.findLeaveApproval(
      leaveId,
      approverId
    );
    if (!leaveApproval)
      throw new NotFoundException(
        this.i18n,
        LEAVE_APPROVALS,
        `${leaveId} , ${approverId}`
      );
    return leaveApproval;
  }

  async updateLeaveApproval(
    leaveId: string,
    approverId: string,
    updateLeaveApprovalDto: UpdateLeaveApprovalDto
  ) {
    const leaveApproval = await this.leaveApprovalsRepository.findLeaveApproval(
      leaveId,
      approverId
    );
    if (!leaveApproval)
      throw new NotFoundException(
        this.i18n,
        LEAVE_APPROVALS,
        `${leaveId} , ${approverId}`
      );
    const updatedLeaveApproval =
      await this.leaveApprovalsRepository.updateLeaveApproval(
        leaveId,
        approverId,
        updateLeaveApprovalDto
      );
    return updatedLeaveApproval;
  }

  async deleteLeaveApproval(leaveId: string, approverId: string) {
    const leaveApproval = await this.leaveApprovalsRepository.findLeaveApproval(
      leaveId,
      approverId
    );
    if (!leaveApproval)
      throw new NotFoundException(
        this.i18n,
        LEAVE_APPROVALS,
        `${leaveId} , ${approverId}`
      );
    await this.leaveApprovalsRepository.deleteLeaveApproval(
      leaveId,
      approverId
    );
    return leaveApproval;
  }
}
