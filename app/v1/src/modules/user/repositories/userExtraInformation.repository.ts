import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { TENANT_DB } from "../../../../src/tenants/constants";
import { TenantDatabase } from "../../../../src/tenants/database/database";
import { EXTRA_INFORMATION_TABLE } from "../user.constants";
import { 
    
    UserExtraInformationTable 
} from "../interfaces/userExtraInformation.interface";
import { EMPLOYEE_CONATCT_TABLE } from "../user.constants";
import { AddUserExtraInformationDto } from "../dto/extraInformationUser.dto";

@Injectable()
export class UserExtraInformationRepository {
    constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase){}

    async findByUserId(userId: string) {
        const extraInfo = await this.tenantDb
            .selectFrom(EXTRA_INFORMATION_TABLE)
            .selectAll()
            .where('user_id', '=', userId)
            .executeTakeFirst()
            return extraInfo 
        }
        

  

     

    async addOrUpdateUserExtraInformation(
        extraInfo: AddUserExtraInformationDto
    ) {
        const result = await this.tenantDb
            .insertInto(EXTRA_INFORMATION_TABLE)
            .values({
                user_id: extraInfo.user_id,
                allergies: extraInfo.allergies || [],
                dietary_restrictions: extraInfo.dietary_restrictions || [],
                spoken_languages: extraInfo.spoken_languages || [],
                shirt_size: extraInfo.shirt_size || null,
                created_at: new Date(),
                updated_at: new Date()
            })
            .onConflict((oc) => oc
                .column('user_id')
                .doUpdateSet({
                    allergies: extraInfo.allergies || [],
                    dietary_restrictions: extraInfo.dietary_restrictions || [],
                    spoken_languages: extraInfo.spoken_languages || [],
                    shirt_size: extraInfo.shirt_size || null,
                    updated_at: new Date()
                })
            )
            .returningAll()
            .executeTakeFirstOrThrow()

           

        

        return result
    }

    async deleteUserExtraInformation(userId: string) {
        const deletedInfo = await this.tenantDb
            .deleteFrom(EXTRA_INFORMATION_TABLE)
            .where('user_id', '=', userId)
            .returningAll()
            .executeTakeFirst()

        return deletedInfo
    }

    async updatePartialUserExtraInformation(
        userId: string, 
        updateData: Partial<Omit<UserExtraInformationTable, 'id' | 'user_id' | 'createdAt'>>
    ) {
        const existingInfo = await this.findByUserId(userId)
        
        if (!existingInfo) {
            throw new NotFoundException(`Extra information for user ${userId} not found`)
        }

        const result = await this.tenantDb
            .updateTable(EXTRA_INFORMATION_TABLE)
            .set({
                ...updateData,
                updated_at: new Date()
            })
            .where('user_id', '=', userId)
            .returningAll()
            .executeTakeFirstOrThrow()

        return result
    }



} 