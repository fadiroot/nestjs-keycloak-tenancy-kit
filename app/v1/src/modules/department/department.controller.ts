import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/createDepartment.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { DEPARTMENT } from './department.constants';
import { UpdateDepartmentDto } from './dto/updateDepartment.dto';
import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../../common/utils/response/response.util';
import { I18nService } from 'nestjs-i18n';
import { HandleErrors } from '../../common/decorators/error-handler.decorator';
import { QueryParams } from '../../common/dto/pagination.dto';
import { TenantProtected } from '../auth/decorators/tenantProtected.decorator';
import { HasPermission } from '../auth/decorators/PermissionUser.decorator';
import { Permissions } from '../permission/enum/permission.enum';

@ApiTags(DEPARTMENT)
@ApiBearerAuth('access-token')
@ApiSecurity('organization-kc-id')
@TenantProtected()
@Controller(DEPARTMENT)
export class DepartmentController {
  constructor(
    private readonly departmentService: DepartmentService,
    private readonly i18n: I18nService
  ) { }

  @Post()
  @HasPermission(Permissions.DEPARTMENTS_CREATE)
  @HandleErrors({
    resource: DEPARTMENT,
    operation: 'post',
    i18nKey: 'departments.create.error',
  })
  @ApiOperation({ summary: 'Create a new department' })
  @ApiBody({
    type: CreateDepartmentDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Department created successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid department data provided',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Department with this name already exists',
  })
  async createDepartment(
    @Body(ValidationPipe) createDepartmentDto: CreateDepartmentDto
  ) {
    const department =
      await this.departmentService.createDepartment(createDepartmentDto);
    return new SuccessResponse(
      await this.i18n.t('departments.create.success'),
      department,
      HttpStatus.CREATED
    );
  }

  @Get()
  @TenantProtected()
  @HasPermission(Permissions.DEPARTMENTS_LIST)
  @HandleErrors({
    resource: DEPARTMENT,
    operation: 'get',
    i18nKey: 'departments.getAll.error',
  })
  @ApiOperation({ summary: 'Get all departments' })
  @ApiQuery({
    name: 'page',
    type: String,
    required: false,
    example: 1,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    type: String,
    required: false,
    example: 10,
    description: 'Number of records per page',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Departments retrieved successfully',
    type: SuccessResponsePaginate,
  })
  async getAllDepartments(@Query() queryParams: QueryParams) {
    const { docs, meta } =
      await this.departmentService.getAllDepartments(queryParams);
    return new SuccessResponsePaginate(
      await this.i18n.t('departments.getAll.success'),
      docs,
      meta
    );
  }

  @Get(':id')
  @HasPermission(Permissions.DEPARTMENTS_READ)
  @HandleErrors({
    resource: DEPARTMENT,
    operation: 'get',
    i18nKey: 'departments.get.error',
  })
  @ApiOperation({ summary: 'Get a department by id' })
  @ApiParam({
    name: 'id',
    description: 'Department identifier',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department retrieved successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Department not found',
  })
  async getDepartment(@Param('id', ParseUUIDPipe) id: string) {
    const department = await this.departmentService.getOneDepartment(id);
    return new SuccessResponse(
      await this.i18n.t('departments.get.success', {
        args: { name: department.name },
      }),
      department
    );
  }

  @Patch(':id')
  @HasPermission(Permissions.DEPARTMENTS_UPDATE)
  @HandleErrors({
    resource: DEPARTMENT,
    operation: 'patch',
    i18nKey: 'departments.update.error',
  })
  @ApiOperation({ summary: 'Update a department' })
  @ApiParam({
    name: 'id',
    description: 'Department identifier',
    example: 1,
  })
  @ApiBody({
    type: UpdateDepartmentDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department updated successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Department not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Department name already exists',
  })
  async updateDepartment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDepartmentDto: UpdateDepartmentDto
  ) {
    const updatedDepartment = await this.departmentService.updateDepartment(
      id,
      updateDepartmentDto
    );
    return new SuccessResponse(
      await this.i18n.t('departments.update.success', {
        args: { name: updatedDepartment.name },
      }),
      updatedDepartment
    );
  }

  @Delete(':id')
  @HasPermission(Permissions.DEPARTMENTS_DELETE)
  @HandleErrors({
    resource: DEPARTMENT,
    operation: 'delete',
    i18nKey: 'departments.delete.error',
  })
  @ApiOperation({ summary: 'Delete a department' })
  @ApiParam({
    name: 'id',
    description: 'Department identifier',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Department not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Department cannot be deleted due to existing references',
  })
  async deleteDepartment(@Param('id', ParseUUIDPipe) id: string) {
    const department = await this.departmentService.deleteDepartment(id);
    return new SuccessMsgResponse(
      await this.i18n.t('departments.delete.success', {
        args: { name: department.name },
      })
    );
  }
}
