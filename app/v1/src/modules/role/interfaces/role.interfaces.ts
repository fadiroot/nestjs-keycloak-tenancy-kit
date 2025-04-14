import { Selectable, Insertable, Updateable } from 'kysely';
import { GenericMapper } from '../../../common/utils/generic-mapper.util';

export interface RoleTable {
  id: string;
  name: string;
  description: string;
  annual_leave_days: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export namespace Role {
  export type selectable = Selectable<RoleTable>;
  export type insertable = Insertable<RoleTable>;
  export type updateable = Updateable<RoleTable>;
}

export class RoleMapper extends GenericMapper<
  Role.selectable,
  Role.insertable,
  Role.updateable
> { }
