import { SetMetadata } from '@nestjs/common';
import { Permissions } from '../../permission/enum/permission.enum';

export const PERMISSIONS_KEY = 'permissions';
export const HasPermission = (...permissions: Permissions[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
