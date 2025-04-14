import { GenericMapper } from "app/v1/src/common/utils/generic-mapper.util";
import e from "express";
import { Selectable, Insertable, Updateable } from "kysely";

export interface EmployeeContactTable {
    employee_email : string , 
    contact_id : string , 
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}
export namespace employeeContact {
    export type selectable = Selectable<EmployeeContactTable>;
    export type insertable = Insertable<EmployeeContactTable>;
    export type updateable = Updateable<EmployeeContactTable>;
  }
  
  export class SocialLinkTypesMapper extends GenericMapper<
    employeeContact.selectable,
    employeeContact.insertable,
    employeeContact.updateable
  > { }