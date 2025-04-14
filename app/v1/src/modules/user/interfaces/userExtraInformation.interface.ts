import { GenericMapper } from "app/v1/src/common/utils/generic-mapper.util";
import { Insertable, Selectable, Updateable } from "kysely";
import { ShirtSize, Allergies, DietaryRestrictions } from "../dto/updateUser.dto";

export interface UserExtraInformationTable {
    id: string;
    user_id: string;
    allergies: Allergies[];
    dietary_restrictions: DietaryRestrictions[];
    spoken_languages: string[];
    shirt_size: ShirtSize | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

export namespace userExtraInformation {
    export type selectable = Selectable<UserExtraInformationTable>;
    export type insertable = Insertable<UserExtraInformationTable>;
    export type updateable = Updateable<UserExtraInformationTable>;
}

export class UserExtraInformationMapper extends GenericMapper<
    userExtraInformation.selectable,
    userExtraInformation.insertable,
    userExtraInformation.updateable
> {}

