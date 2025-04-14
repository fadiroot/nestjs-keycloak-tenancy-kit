import { Selectable, Insertable, Updateable } from 'kysely';
import { GenericMapper } from '../../../common/utils/generic-mapper.util';

export interface SocialLinkTypesTable {
  id: string;
  name: string;
  icon: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export namespace socialLinkTypes {
  export type selectable = Selectable<SocialLinkTypesTable>;
  export type insertable = Insertable<SocialLinkTypesTable>;
  export type updateable = Updateable<SocialLinkTypesTable>;
}

export class SocialLinkTypesMapper extends GenericMapper<
  socialLinkTypes.selectable,
  socialLinkTypes.insertable,
  socialLinkTypes.updateable
> { }