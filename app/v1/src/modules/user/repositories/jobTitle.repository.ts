import { Injectable, Inject } from "@nestjs/common";
import { TENANT_DB } from "../../../tenants/constants";
import { TenantDatabase } from "../../../tenants/database/database";
import { JOB_TITLE_TABLE } from "../user.constants";
import { JobTitleDto } from "../dto/createJobTitle.dto";
import { JobTitleMapper } from "../interfaces/jobTitle.interface";

@Injectable()
export class JobTitleRepository {
    constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase) {}

    async getAllJobTitles() {
        const titles  =  await this.tenantDb
            .selectFrom(JOB_TITLE_TABLE)
            .selectAll()
            .execute();
        return titles ? JobTitleMapper.toDomain(titles) : []
    }

    async findByTitle(title: string) {
        return await this.tenantDb
            .selectFrom(JOB_TITLE_TABLE)
            .selectAll()
            .where('job_title', '=', title)
            .executeTakeFirst();
    }

    async createJobTitle(jobTitleDto: JobTitleDto) {
        const title = JobTitleMapper.toInsertable({...jobTitleDto});
        
        // Check if title already exists
        const existingTitle = await this.findByTitle(title.title);
        console.log(existingTitle , "kkkk")
        if (existingTitle) {
            throw new Error('Job title already exists');
        }

        return await this.tenantDb
            .insertInto(JOB_TITLE_TABLE)
            .values(title)
            .returningAll()
            .executeTakeFirst();
    }

    async updateJobTitle(id: string, jobTitleDto: JobTitleDto) {
        const title = JobTitleMapper.toInsertable({...jobTitleDto});

        const existingTitle = await this.tenantDb
            .selectFrom(JOB_TITLE_TABLE)
            .selectAll()
            .where('job_title', '=', title.title)
            .where('id', '!=', id)
            .executeTakeFirst();

        if (existingTitle) {
            throw new Error('This title is already used by another record');
        }

        return await this.tenantDb
            .updateTable(JOB_TITLE_TABLE)
            .set({
                ...title,
                updated_at: new Date(),
            })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirst();
    }
}