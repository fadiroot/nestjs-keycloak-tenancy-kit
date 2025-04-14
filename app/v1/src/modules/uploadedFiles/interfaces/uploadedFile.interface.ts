import { Selectable, Insertable, Updateable } from "kysely";
import { GenericMapper } from "../../../common/utils/generic-mapper.util";

export interface UploadedFilesTable {
    entity_id : string , 
    entity_type : string , 
    file_url : string ,
    file_type: string,
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

export namespace uploadedFiles {
    export type selectable = Selectable<UploadedFilesTable>;
    export type insertable = Insertable<UploadedFilesTable>;
    export type updateable = Updateable<UploadedFilesTable>;
  }
  
  export class UploadedFilesMapper extends GenericMapper<
    uploadedFiles.selectable,
    uploadedFiles.insertable,
    uploadedFiles.updateable
  > { }