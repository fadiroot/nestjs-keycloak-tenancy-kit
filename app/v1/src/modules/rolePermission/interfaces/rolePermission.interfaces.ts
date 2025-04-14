import { Selectable, Insertable, Updateable } from 'kysely';
import { GenericMapper } from '../../../common/utils/generic-mapper.util';

export interface RolePermissionTable {
  role_id: string;
  permission_id: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export namespace RolePermission {
  export type selectable = Selectable<RolePermissionTable>;
  export type insertable = Insertable<RolePermissionTable>;
  export type updateable = Updateable<RolePermissionTable>;
}

export class RolePermissionMapper extends GenericMapper<
  RolePermission.selectable,
  RolePermission.insertable,
  RolePermission.updateable
> {}
