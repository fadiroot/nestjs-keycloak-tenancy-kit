import { Inject, Injectable } from "@nestjs/common";
import { TENANT_DB } from "../../../../src/tenants/constants";
import { TenantDatabase } from "../../../../src/tenants/database/database";
import { EDUCATION_TABLE } from "../user.constants";
import { UpdateUserDto } from "../dto/updateUser.dto";

@Injectable()
export class EducationRepository {
    constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase){}

    async findAllEducationByUserId(userId: string){
        const educations = await this.tenantDb
        .selectFrom(EDUCATION_TABLE)
        .selectAll()
        .where('user_id','=' , userId)
        .execute()
        return educations
    }

    async addMultipleEducationsForUser(
        userId: string, 
        educations: UpdateUserDto['education'] | Array<UpdateUserDto['education']>
    ) {
        const educationArray = Array.isArray(educations) ? educations : [educations];
        await this.tenantDb.deleteFrom(EDUCATION_TABLE).where('user_id' , "=" , userId).execute()

        if (educationArray.length === 0) return []

        const result = await this.tenantDb
        .insertInto(EDUCATION_TABLE)
        .values(educationArray.map(edu => ({
            user_id: userId,
            institution: edu.institution,
            degree: edu.degree,
            start_date: edu.start_date,
            end_date: edu.end_date || null,
            created_at: new Date(),
            updated_at: new Date()
        })))
        .returningAll()
        .execute()

        return result
    }


}