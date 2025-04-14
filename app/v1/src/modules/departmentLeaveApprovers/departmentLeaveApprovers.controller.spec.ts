import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentLeaveApproversController } from './departmentLeaveApprovers.controller';
import { DepartmentLeaveApproversService } from './departmentLeaveApprovers.service';
import { I18nService } from 'nestjs-i18n';
import {
  SuccessResponse,
  SuccessResponsePaginate,
} from '../../common/utils/response/response.util';

describe('DepartmentLeaveApproversController', () => {
  let controller: DepartmentLeaveApproversController;
  let service: DepartmentLeaveApproversService;
  let i18n: I18nService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentLeaveApproversController],
      providers: [
        {
          provide: DepartmentLeaveApproversService,
          useValue: {
            getAllDepartmentLeaveApprovers: jest.fn(),
            getOneDepartmentLeaveApprover: jest.fn(),
            deleteDepartmentLeaveApprover: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockResolvedValue('translated_message'),
          },
        },
      ],
    }).compile();

    controller = module.get<DepartmentLeaveApproversController>(
      DepartmentLeaveApproversController
    );
    service = module.get<DepartmentLeaveApproversService>(
      DepartmentLeaveApproversService
    );
    i18n = module.get<I18nService>(I18nService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  
  describe('findOne', () => {
    it('should return a department leave approver by ID', async () => {
      const mockApprover = { id: '1', name: 'Approver 1' };
      jest
        .spyOn(service, 'getOneDepartmentLeaveApprover')
        .mockResolvedValue(mockApprover);

      const departmentId = '1';
      const approverId = '2';

      const result = await controller.getDepartmentLeaveApprover(
        departmentId,
        approverId
      );
      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.message).toBe('translated_message');
      expect(service.getOneDepartmentLeaveApprover).toHaveBeenCalledWith(
        departmentId,
        approverId
      );
    });
  });

  describe('deleteDepartmentLeaveApprover', () => {
    it('should delete a department leave approver by ID', async () => {
      const mockApprover = { id: '1', name: 'Approver 1' };
      jest
        .spyOn(service, 'deleteDepartmentLeaveApprover')
        .mockResolvedValue(mockApprover);

      const departmentId = '1';
      const approverId = '2';

      const result = await controller.deleteDepartmentLeaveApprover(
        departmentId,
        approverId
      );
      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.message).toBe('translated_message');
      expect(service.deleteDepartmentLeaveApprover).toHaveBeenCalledWith(
        departmentId,
        approverId
      );
    });
  });
});
