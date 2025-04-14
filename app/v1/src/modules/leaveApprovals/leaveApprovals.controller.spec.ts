import { Test, TestingModule } from '@nestjs/testing';
import { LeaveApprovalsController } from './leaveApprovals.controller';
import { LeaveApprovalsService } from './leaveApprovals.service';
import { I18nService } from 'nestjs-i18n';
import {
  SuccessResponse,
  SuccessResponsePaginate,
} from '../../common/utils/response/response.util';
import { UserService } from '../user/user.service';
import { TenantAccessGuard } from '../auth/guards/tenantAccess.guard';
import { PermissionGuard } from '../auth/guards/permisson.guard';
import { RolePermissionService } from '../rolePermission/rolePermission.service';

describe('LeaveApprovalsController', () => {
  let controller: LeaveApprovalsController;
  let service: LeaveApprovalsService;

  const mockI18nService = {
    t: jest.fn().mockResolvedValue('Mocked Translation'),
  };

  const mockLeaveApprovalsService = {
    getAllLeaveApprovals: jest.fn().mockResolvedValue({
      docs: [
        { id: '1', leaveId: '101', approverId: '201', status: 'APPROVED' },
      ],
      meta: { totalDocs: 1, limit: 10, page: 1, totalPages: 1 },
    }),
    getOneLeaveApproval: jest.fn().mockResolvedValue({
      id: '1',
      leaveId: '101',
      approverId: '201',
      status: 'APPROVED',
    }),
  };
  const mockPermissionGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaveApprovalsController],
      providers: [
        {
          provide: LeaveApprovalsService,
          useValue: mockLeaveApprovalsService,
        },
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: TenantAccessGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: RolePermissionService,
          useValue: {
            checkPermission: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: PermissionGuard,
          useValue: mockPermissionGuard,
        },
      ],
    }).compile();

    controller = module.get<LeaveApprovalsController>(LeaveApprovalsController);
    service = module.get<LeaveApprovalsService>(LeaveApprovalsService);
  });

  describe('getAllLeaveApprovals', () => {
    it('should retrieve a paginated list of leave approvals', async () => {
      const queryParams = { page: 1, limit: 10 };
      const result = await controller.getAllLeaveApprovals('101', queryParams);

      expect(service.getAllLeaveApprovals).toHaveBeenCalledWith(
        '101',
        queryParams
      );
      expect(result).toEqual(
        new SuccessResponsePaginate(
          'Mocked Translation',
          [{ id: '1', leaveId: '101', approverId: '201', status: 'APPROVED' }],
          {
            totalDocs: 1,
            limit: 10,
            page: 1,
            totalPages: 1,
          }
        )
      );
    });
  });

  describe('getLeaveApproval', () => {
    it('should retrieve a single leave approval by leaveId and approverId', async () => {
      const mockedLeaveApproval = {
        id: '1',
        leaveId: '101',
        approverId: '201',
        status: 'APPROVED',
      };
      jest
        .spyOn(service, 'getOneLeaveApproval')
        .mockResolvedValue(mockedLeaveApproval);
      const result = await controller.getLeaveApproval('101', '201');
      expect(service.getOneLeaveApproval).toHaveBeenCalledWith('101', '201');
      expect(result).toEqual(
        new SuccessResponse('Mocked Translation', mockedLeaveApproval)
      );
    });
  });
});
