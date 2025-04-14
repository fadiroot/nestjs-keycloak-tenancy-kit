import { GenericMapper } from "../../../common/utils/generic-mapper.util";
import { Insertable, Selectable, Updateable } from "kysely";

export interface EducationTable {
    id: string;
    user_id: string;
    institution: string;
    degree: string;
    startDate: Date;
    endDate: Date;

}
export namespace education {
    export type selectable = Selectable<EducationTable>;
    export type insertable = Insertable<EducationTable>;
    export type updateable = Updateable<EducationTable>;
  }
  
  export class UserMapper extends GenericMapper<
    education.selectable,
    education.insertable,
    education.updateable
  > {}
  