import { Selectable, Insertable, Updateable } from 'kysely';
import { GenericMapper } from '../../../common/utils/generic-mapper.util';

export interface UserSocialLinksTable {
  user_id: string;
  social_link_type_id: string;
  link_url: string;
  updated_at:Date;
  created_at:Date;
}

export namespace userSocialLinks {
  export type selectable = Selectable<UserSocialLinksTable>;
  export type insertable = Insertable<UserSocialLinksTable>;
  export type updateable = Updateable<UserSocialLinksTable>;
}

export class UserSocialLinksMapper extends GenericMapper<
  userSocialLinks.selectable,
  userSocialLinks.insertable,
  userSocialLinks.updateable
> {}