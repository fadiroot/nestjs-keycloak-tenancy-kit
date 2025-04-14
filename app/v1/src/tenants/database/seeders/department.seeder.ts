import { DEPARTMENT_TABLE } from "../../../../src/modules/department/department.constants";
import { Kysely } from "kysely";

export async function seedeDepartment(db: Kysely<any>)  {
    const tableExists = await db
    .selectFrom('information_schema.tables')
    .select('table_name')
    .where('table_name', '=', DEPARTMENT_TABLE)
    .execute();

    if (tableExists.length === 0) {
        console.log(`Table ${DEPARTMENT_TABLE} does not exist, skipping seeding... `);
        return;
      }

    const departmentAdminstration = { 
        name : "administration" , 
        is_default: true
    }
    const exist = await db
    .selectFrom(DEPARTMENT_TABLE)
    .selectAll()
    .where(`${DEPARTMENT_TABLE}.name`, '=' , departmentAdminstration.name)
    .executeTakeFirst()

    if (!exist){
        await db.insertInto(DEPARTMENT_TABLE).values(departmentAdminstration).execute()
    }

    
}