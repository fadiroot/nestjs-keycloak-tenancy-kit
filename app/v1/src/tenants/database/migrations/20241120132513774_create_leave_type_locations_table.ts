import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('leave_type_locations')
    .addColumn('location_id', 'uuid', (col) =>
      col.notNull().references('locations.id').onDelete('cascade')
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
    .addPrimaryKeyConstraint('pk_leave_type_locations', [
      'leave_type_id',
      'location_id',
    ])
    .execute();
  await db.schema
    .createIndex('leave_type_locations_idx')
    .on('leave_type_locations')
    .column('location_id')
    .column('leave_type_id')
    .execute();
}

export async function down(db: Kysely<unknown>) {
  db.schema.dropTable('leave_type_locations').execute();
}
