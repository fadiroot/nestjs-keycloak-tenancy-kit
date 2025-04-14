import { PartialType } from '@nestjs/swagger';
import { CreateLocationDto } from './createLocation.dto';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { LOCATION } from '../location.constants';
@ModuleName(LOCATION)
export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
