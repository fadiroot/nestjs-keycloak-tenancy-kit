import { PartialType } from '@nestjs/swagger';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { DEPARTMENT } from '../department.constants';
import { CreateDepartmentDto } from './createDepartment.dto';
@ModuleName(DEPARTMENT)
export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}
