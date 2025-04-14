import { Kysely } from 'kysely';
import { LEAVE_TYPE_TABLE } from '../../../modules/leaveTypes/leaveTypes.constants';

export async function seedLeaveTypes(db: Kysely<any>) {
  // Check if the 'leave_types' table exists by querying the information schema
  const tableExists = await db
    .selectFrom('information_schema.tables')
    .select('table_name')
    .where('table_name', '=', LEAVE_TYPE_TABLE)
    .execute();

  // If the table does not exist, return early
  if (tableExists.length === 0) {
    console.log('Table "leave_types" does not exist, skipping seeding...');
    return;
  }

  const defaultLeaveTypes = [
    {
      name: 'Sick Leave',
      assign_to_type: "DEPARTMENTS",
      approver_type: 'specific',
      yearly_quota_type: 'unlimited',
      yearly_quota_value: 0, // Unlimited quota (handled logically)
      yearly_quota_unit: 'days',
      allow_negative_balance: true,
      reason_required: true,
      subtract_weekends: false,
      default: false,
      icon: 1
    },
    {
      name: 'Authorization Leave',
      assign_to_type: "DEPARTMENTS",
      approver_type: 'specific',
      yearly_quota_type: 'limited',
      yearly_quota_value: 8, // 8 hours
      yearly_quota_unit: 'hours',
      allow_negative_balance: false,
      reason_required: true,
      subtract_weekends: false,
      default: false,
      icon:2
    },
    {
      name: 'Vacation Leave',
      assign_to_type: "DEPARTMENTS",
      approver_type: 'specific',
      yearly_quota_type: 'limited',
      yearly_quota_value: 21, // 21 days per year
      yearly_quota_unit: 'days',
      allow_negative_balance: false,
      reason_required: false,
      subtract_weekends: false,
      default: false,
      icon:3
    },
  ];

  // Insert the default leave types into the table, with conflict handling for duplicates
  for (const leaveType of defaultLeaveTypes) {
    const exist = await db
      .selectFrom(LEAVE_TYPE_TABLE)
      .selectAll()
      .where('leave_types.name', '=', leaveType.name)
      .executeTakeFirst();

    if (!exist)
      await db.insertInto(LEAVE_TYPE_TABLE).values(leaveType).execute();
  }

  console.log('Default leave types seeded successfully.');
}
