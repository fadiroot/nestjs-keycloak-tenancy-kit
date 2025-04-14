import { Injectable, Inject } from "@nestjs/common";
import { TENANT_DB } from "../../..//tenants/constants";
import { TenantDatabase } from "../../..//tenants/database/database";
import { EMERGENCEY_CONTACT_TABLE } from "../user.constants";
import { UpdateUserDto } from "../dto/updateUser.dto";

@Injectable()
export class EmergencyRepository {
    constructor (@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase){}
    
    async findAllEmergenciesByUserId(userId: string){
        const emergencies = await this.tenantDb
        .selectFrom(EMERGENCEY_CONTACT_TABLE)
        .selectAll()
        .where('user_id', '=', userId)
        .execute()
        return emergencies
    }

    async addMultipleEmergenciesForUser(
        userId: string, 
        emergencies: UpdateUserDto['emergencyContact'] | Array<UpdateUserDto['emergencyContact']>
    ) {

        const emergencyArray = Array.isArray(emergencies) ? emergencies : [emergencies];
        await this.tenantDb.deleteFrom(EMERGENCEY_CONTACT_TABLE).where('user_id' , '=' , userId).execute()

        if (emergencyArray.length === 0) return []
        const result = await this.tenantDb
        .insertInto(EMERGENCEY_CONTACT_TABLE)
        .values(emergencyArray.map(emergency => ({
            user_id: userId,
            relationship: emergency.relationship,
            mobile_phone: emergency.mobilePhone,
            email: emergency.email || null,
            address: emergency.address || null,
            created_at: new Date(),
            updated_at: new Date()
        })))
        .returningAll()
        .execute()

        return result
    }
}