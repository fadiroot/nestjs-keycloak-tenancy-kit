import { Test, TestingModule } from '@nestjs/testing';
import { RoleUserController } from './role_user.controller';
import { RoleUserService } from './role_user.service';
import { CreateRoleUserDto } from './dto/create-role_user.dto';
import { UpdateRoleUserDto } from './dto/update-role_user.dto';
import {
  SuccessResponse,
  SuccessResponsePaginate,
  SuccessMsgResponse,
} from '../../common/utils/response/response.util';
import { I18nService } from 'nestjs-i18n';

describe('RoleUserController', () => {
  let controller: RoleUserController;
  let service: RoleUserService;
  let i18n: I18nService;

  const mockUuid = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleUserController],
      providers: [
        {
          provide: RoleUserService,
          useValue: {
            createRoleUser: jest.fn(),
            getAllRoleUsers: jest.fn(),
            getOneRoleUser: jest.fn(),
            updateRoleUser: jest.fn(),
            deleteRoleUser: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockImplementation((key: string) => key),
          },
        },
      ],
    }).compile();

    controller = module.get<RoleUserController>(RoleUserController);
    service = module.get<RoleUserService>(RoleUserService);
    i18n = module.get<I18nService>(I18nService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRoleUser', () => {
    it('should create a new role user', async () => {
      const createRoleUserDto = [new CreateRoleUserDto()];
      createRoleUserDto[0].roleId = mockUuid;
      createRoleUserDto[0].userId = mockUuid;

      const mockCreatedRoleUser = {
        id: mockUuid,
        roleId: mockUuid,
        userId: mockUuid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(service, 'createRoleUser')
        .mockResolvedValue(mockCreatedRoleUser as any);

      const result = await controller.createRoleUser(createRoleUserDto);

      expect(service.createRoleUser).toHaveBeenCalledWith(createRoleUserDto);
      expect(result).toEqual(
        new SuccessResponse('roleUser.create.success', mockCreatedRoleUser, 201)
      );
    });
  });

  describe('getAllRoleUsers', () => {
    it('should retrieve a paginated list of role users', async () => {
      const roleUsers = [
        {
          id: mockUuid,
          roleId: mockUuid,
          userId: mockUuid,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: mockUuid,
          roleId: mockUuid,
          userId: mockUuid,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const paginationMeta = { total: 2, page: 1, limit: 10 };
      jest.spyOn(service, 'getAllRoleUsers').mockResolvedValue({
        docs: roleUsers,
        meta: {
          total: 8,
          page: 1,
          limit: 10,
          totalPages: 1,
          pagingCounter: 1,
          hasPrevPage: false,
          hasNextPage: false,
          hasMore: false,
        },
      });

      const result = await controller.getAllRoleUsers({
        page: 1,
        limit: 10,
      });

      expect(result);
      expect(service.getAllRoleUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getRoleUser', () => {
    it('should retrieve a role user by id', async () => {
      const roleUser = {
        id: mockUuid,
        roleId: mockUuid,
        userId: mockUuid,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      jest.spyOn(service, 'getOneRoleUser').mockResolvedValue(roleUser);

      const result = await controller.getRoleUser(mockUuid);

      expect(service.getOneRoleUser).toHaveBeenCalledWith(mockUuid);
      expect(result).toEqual(
        new SuccessResponse('roleUser.get.success', roleUser)
      );
    });
  });

  describe('updateRoleUser', () => {
    it('should update a role user', async () => {
      const updateRoleUserDto = new UpdateRoleUserDto();
      updateRoleUserDto.roleId = mockUuid;

      const updatedRoleUser = {
        id: mockUuid,
        roleId: mockUuid,
        userId: mockUuid,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };

      jest.spyOn(service, 'updateRoleUser').mockResolvedValue(updatedRoleUser);

      const result = await controller.updateRoleUser(
        mockUuid,
        updateRoleUserDto
      );

      expect(service.updateRoleUser).toHaveBeenCalledWith(
        mockUuid,
        updateRoleUserDto
      );
      expect(result).toEqual(
        new SuccessResponse('roleUser.update.success', updatedRoleUser)
      );
    });
  });

  describe('deleteRoleUser', () => {
    it('should delete a role user', async () => {
      const deletedRoleUser = {
        id: mockUuid,
        roleId: mockUuid,
        userId: mockUuid,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      jest.spyOn(service, 'deleteRoleUser').mockResolvedValue(deletedRoleUser);

      const result = await controller.deleteRoleUser(mockUuid);

      expect(service.deleteRoleUser).toHaveBeenCalledWith(mockUuid);
      expect(result).toEqual(new SuccessMsgResponse('roleUser.delete.success'));
    });
  });
});
