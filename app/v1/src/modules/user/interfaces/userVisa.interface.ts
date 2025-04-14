import { GenericMapper } from "app/v1/src/common/utils/generic-mapper.util";
import { Insertable, Selectable, Updateable } from "kysely";

export interface UserVisaTable {
    id: string;
    user_id: string;
    visa_type: 'work_visa' | 'student_visa' | 'tourist_visa' | 'business_visa' | 'transit_visa' | 'permanent_residence' | 'temporary_residence' | 'diplomatic_visa' | 'official_visa' | 'family_reunion_visa' | 'investor_visa' | 'skilled_worker_visa' | 'startup_visa' | 'research_visa';
    status: 'pending' | 'approved' | 'rejected' | 'expired' | 'in_process' | 'under_review' | 'cancelled' | 'suspended';
    issuing_country: string;
    delivery_date: Date;
    expiration_date: Date;
    notes?: string;
    created_at: Date;
    updated_at: Date;
}

export namespace userVisa {
    export type selectable = Selectable<UserVisaTable>;
    export type insertable = Insertable<UserVisaTable>;
    export type updateable = Updateable<UserVisaTable>;
}

export class UserVisaMapper extends GenericMapper<
    userVisa.selectable,
    userVisa.insertable,
    userVisa.updateable
> {} 