import { GenericMapper } from "../../../../src/common/utils/generic-mapper.util";
import { Insertable, Selectable, Updateable } from "kysely";

export interface JobTitleTable {
    id: string;
    job_title: string;
    created_at: Date;
    updated_at: Date;
}

export namespace jobTitle {
    export type selectable = Selectable<JobTitleTable>;
    export type insertable = Insertable<JobTitleTable>;
    export type updateable = Updateable<JobTitleTable>;
}

export class JobTitleMapper extends GenericMapper<
    jobTitle.selectable,
    jobTitle.insertable,
    jobTitle.updateable
> {}
