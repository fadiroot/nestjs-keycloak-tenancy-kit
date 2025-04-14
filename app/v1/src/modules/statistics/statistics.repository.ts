import { Inject, Injectable } from "@nestjs/common";
import { TENANT_DB } from "../../tenants/constants";
import { TenantDatabase } from "../../tenants/database/database";
import { sql } from "kysely";
 @Injectable()
export class StatisticsRepository {
    constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase) {}
    async statisticsOfUsers(table: string, column: string) {

        return await sql` 
         select d.id , d.name ,count(u.id) as count  from ${sql.raw(table)} d
         left join users u on u.${sql.raw(column)} = d.id
         group by d.id`.execute(this.tenantDb);
     }
   


}