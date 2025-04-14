import { Selectable, Insertable, Updateable } from 'kysely';
import { GenericMapper } from '../../../common/utils/generic-mapper.util';

export interface PermissionTable {
  id: string;
  name: string;
  resource: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export namespace Permission {
  export type selectable = Selectable<PermissionTable>;
  export type insertable = Insertable<PermissionTable>;
  export type updateable = Updateable<PermissionTable>;
}

export class PermissionMapper extends GenericMapper<
  Permission.selectable,
  Permission.insertable,
  Permission.updateable
> {}
