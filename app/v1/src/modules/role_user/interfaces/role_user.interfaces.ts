import { Selectable, Insertable, Updateable } from 'kysely';
import { GenericMapper } from '../../../common/utils/generic-mapper.util';

export interface RoleUserTable {
  id: string;
  roleId: string;
  userId: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export namespace RoleUser {
  export type selectable = Selectable<RoleUserTable>;
  export type insertable = Insertable<RoleUserTable>;
  export type updateable = Updateable<RoleUserTable>;
}

export class RoleUserMapper extends GenericMapper<
  RoleUser.selectable,
  RoleUser.insertable,
  RoleUser.updateable
> {}
