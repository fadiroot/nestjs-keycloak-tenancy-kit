import { Kysely } from "kysely";
import { SOCIAL_LINK_TYPES_TABLE } from "../../../../src/modules/user/user.constants";

export async function seedSocialLinkTypes(db: Kysely<any>) {
  // Check if the 'social_link_types' table exists by querying the information schema
  const tableExists = await db
    .selectFrom('information_schema.tables')
    .select('table_name')
    .where('table_name', '=', SOCIAL_LINK_TYPES_TABLE)
    .execute();

  // If the table does not exist, return early
  if (tableExists.length === 0) {
    console.log('Table "social_link_types" does not exist, skipping seeding...');
    return;
  }

  const defaultSocialLinkTypes = [
    {
      name: 'Facebook',
      icon: 'facebook'
    },
    {
      name: 'Instagram',
      icon: 'instagram'
    },
    {
      name: 'X (Twitter)',
      icon: 'x-twitter'
    },
    {
      name: 'GitHub',
      icon: 'github'
    },
    {
      name: 'Dribbble',
      icon: 'dribbble'
    },
    {
      name: 'LinkedIn',
      icon: 'linkedin'
    },
    {
      name: 'YouTube',
      icon: 'youtube'
    },
    {
      name: 'Medium',
      icon: 'medium'
    }
  ];

  // Insert the default social link types into the table, with conflict handling for duplicates
  for (const socialLinkType of defaultSocialLinkTypes) {
    const exist = await db
      .selectFrom(SOCIAL_LINK_TYPES_TABLE)
      .selectAll()
      .where('name', '=', socialLinkType.name)
      .executeTakeFirst();

    if (!exist)
      await db.insertInto(SOCIAL_LINK_TYPES_TABLE).values(socialLinkType).execute();
  }

  console.log('Default social link types seeded successfully.');
}

