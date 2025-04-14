import { Injectable, Inject } from "@nestjs/common";
import { TENANT_DB } from "../../../tenants/constants";
import { TenantDatabase } from "../../..//tenants/database/database";
import { VISA_TABLE } from "../user.constants";
import { UpdateUserDto } from "../dto/updateUser.dto";

@Injectable()
export class VisaRepository {
    constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase){}

    async findAllVisasByUserId(userId: string){
        const visas = await this.tenantDb
        .selectFrom(VISA_TABLE)
        .selectAll()
        .where('user_id', '=', userId)
        .execute()
        return visas
    }

    async addMultipleVisasForUser(
        userId: string, 
        visas: UpdateUserDto['visa'] | Array<UpdateUserDto['visa']>
    ) {
        // Ensure visas is always an array
        
        const visaArray = Array.isArray(visas) ? visas : [visas];
        await this.tenantDb.deleteFrom(VISA_TABLE).where('user_id' , "=" , userId).execute()

        if (visaArray.length === 0) return []

        const result = await this.tenantDb
        .insertInto(VISA_TABLE)
        .values(visaArray.map(visa => ({
            user_id: userId,
            visa_type: visa.visa_type,
            status: visa.status,
            issuing_country: visa.issuing_country,
            delivery_date: visa.delivery_date,
            expiration_date: visa.expiration_date,
            notes: visa.notes || null,
            created_at: new Date(),
            updated_at: new Date()
        })))
        .returningAll()
        .execute()

        return result
    }
} 