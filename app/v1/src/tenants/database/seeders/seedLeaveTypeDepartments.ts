import { Kysely } from 'kysely';
import { LEAVE_TYPE_TABLE } from '../../../modules/leaveTypes/leaveTypes.constants';
import { DEPARTMENT_TABLE } from '../../../modules/department/department.constants';

export async function seedLeaveTypeDepartments(db: Kysely<any>) {
  const tableExists = await db
    .selectFrom('information_schema.tables')
    .select('table_name')
    .where('table_name', '=', 'leave_type_departments')
    .execute();

  if (tableExists.length === 0) {
    console.log(
      'Table "leave_type_departments" does not exist, skipping seeding...'
    );
    return;
  }

  const leaveTypesTableExists = await db
    .selectFrom('information_schema.tables')
    .select('table_name')
    .where('table_name', '=', LEAVE_TYPE_TABLE)
    .execute();

  if (leaveTypesTableExists.length === 0) {
    console.log('Table "leave_types" does not exist, skipping seeding...');
    return;
  }
  const departmentTableExists = await db
    .selectFrom('information_schema.tables')
    .select('table_name')
    .where('table_name', '=', DEPARTMENT_TABLE)
    .execute();

  if (departmentTableExists.length === 0) {
    console.log('Table "departments" does not exist, skipping seeding...');
    return;
  }

  const leaveTypes = await db
    .selectFrom(LEAVE_TYPE_TABLE)
    .selectAll()
    .execute();
  const departments = await db
    .selectFrom(DEPARTMENT_TABLE)
    .selectAll()
    .execute();
  for (const leaveType of leaveTypes) {
    for (const department of departments) {
      const exist = await db
        .selectFrom('leave_type_departments')
        .selectAll()
        .where('leave_type_id', '=', leaveType.id)
        .executeTakeFirst();

      if (!exist)
        await db
          .insertInto('leave_type_departments')
          .values({ leave_type_id: leaveType.id, department_id: department.id })
          .execute();
    }
  }

  console.log('Default leave types seeded successfully.');
}
