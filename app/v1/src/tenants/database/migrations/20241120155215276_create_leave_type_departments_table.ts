import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('leave_type_departments')
    .addColumn('department_id', 'uuid', (col) =>
      col.notNull().references('departments.id').onDelete('cascade')
    )
    .addColumn('leave_type_id', 'uuid', (col) =>
      col.notNull().references('leave_types.id').onDelete('cascade')
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('deleted_at', 'timestamp', (col) => col.defaultTo(null))
    .addPrimaryKeyConstraint('pk_leave_type_departments', [
      'leave_type_id',
      'department_id',
    ])
    .execute();
  await db.schema
    .createIndex('leave_type_departments_idx')
    .on('leave_type_departments')
    .column('department_id')
    .column('leave_type_id')
    .execute();
}

export async function down(db: Kysely<unknown>) {
  db.schema.dropTable('leave_type_departments').execute();
}
