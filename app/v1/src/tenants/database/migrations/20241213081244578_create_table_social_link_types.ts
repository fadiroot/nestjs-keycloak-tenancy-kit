import { Kysely , sql} from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql `
      CREATE TABLE social_link_types (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid() , 
      name VARCHAR(100), 
      icon VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP

      ) ; 

      CREATE TABLE user_social_links (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE , 
        social_link_type_id UUID REFERENCES social_link_types(id) ,
        link_url VARCHAR(200) ,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        PRIMARY KEY (user_id , social_link_type_id)
      )
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await sql `
     DROP TABLE IF EXISTS social_link_types, 
     DROP TABLE IF EXISTS user_social_links
  `
}
