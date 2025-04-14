import { GenericMapper } from "app/v1/src/common/utils/generic-mapper.util";
import { Insertable, Selectable, Updateable } from "kysely";

export interface EmergencyContactTable {
    id: string;
    user_id: string;
    relationship: 'brother' | 'sister' | 'father' | 'mother' | 'son' | 'daughter' | 'spouse' | 'partner' | 'other';
    mobile_phone: string;
    email?: string;
    addresse?: string;
    created_at: Date;
    updated_at: Date;
}

export namespace emergencyContact {
    export type selectable = Selectable<EmergencyContactTable>;
    export type insertable = Insertable<EmergencyContactTable>;
    export type updateable = Updateable<EmergencyContactTable>;
}

export class EmergencyContactMapper extends GenericMapper<
    emergencyContact.selectable,
    emergencyContact.insertable,
    emergencyContact.updateable
> {} 