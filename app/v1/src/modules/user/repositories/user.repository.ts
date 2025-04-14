import { Inject, Injectable } from '@nestjs/common';
import { TENANT_DB } from '../../../tenants/constants';
import { TenantDatabase } from '../../../tenants/database/database';
import { user, UserMapper, UserTable } from '../interfaces/user.interface';
import { CreateUserDto } from '../dto/createUser.dto';
import {
  EMPLOYEE_CONATCT_TABLE,
  PENDING_USERS_TABLE,
  USERS_TABLE,
} from '../user.constants';
import {
  pending_users,
  PendingUserMapper,
} from '../interfaces/pendingUsers.interface';
import { sql } from 'kysely';
import { QueryParams } from '../../../common/dto/pagination.dto';
import { QueryBuilderUtility } from '../../../common/utils/queryBuilder.util';
import { InviteEmployeeDto } from '../dto/inviteEmplyee.dto';
import { AddWelcomeKitDto } from '../dto/addWelcomeKit.dto';
@Injectable()
export class UserRepository {
  constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase) {}

  private addDepartmentLocationSubqueries(query: any) {
    return query.select([
      sql`
        COALESCE(
          (SELECT json_build_object('id', d.id, 'name', d.name)
          FROM departments AS d 
          WHERE d.id = users.department_id),
          '{}'::json
        )
      `.as('department'),

      sql`
        COALESCE(
          (SELECT json_build_object('id', l.id, 'name', l.name)
          FROM locations AS l 
          WHERE l.id = users.location_id),
          '{}'::json
        )
      `.as('location'),
    ]);
  }

  async findUsersPaginated(queryParams: QueryParams, offset: number) {
    const { limit, sort, search, filter } = queryParams;
    let query = this.tenantDb.selectFrom('users');
    if (filter)
      if (
        filter?.departmentId &&
        filter?.isApprover &&
        filter.isApprover === 'false'
      ) {
        query = query
          .leftJoin('department_leave_approvers as dla', (join) =>
            join
              .onRef('dla.user_id', '=', 'users.id')
              .on('dla.department_id', '=', filter.departmentId)
          )
          .where('dla.user_id', 'is', null);
        delete filter.isApprover;
        delete filter.departmentId;
      }

    query = QueryBuilderUtility.applyQueryOptions(query, {
      filter,
      allowedFilterFields: [],
      search,
      searchFields: ['users.first_name' , 'users.last_name'],
      sort,
      defaultSortField: 'users.created_at',
      defaultSortOrder: 'asc',
    });

    const countQuery = this.tenantDb
      .selectFrom(query.select('users.id').as('filtered_users'))
      .select(sql<number>`count(*)`.as('count'));
    const countResult = await countQuery.executeTakeFirst();

    const users = await this.addDepartmentLocationSubqueries(query)
      .selectAll()
      .offset(offset)
      .limit(limit)
      .execute();

    const total = Number(countResult?.count || 0);
    return {
      docs: users ? UserMapper.toDomain(users) : [],
      total,
    };
  }

  async findAll(ids) {
    if (!this.tenantDb) {
      throw new Error('Database connection not initialized');
    }
    let users = this.tenantDb
      .selectFrom(USERS_TABLE)
      .selectAll()
      .where('deleted_at', 'is', null);
    if (ids && ids && Array.isArray(ids)) {
      users = users.where('id', 'in', ids);
    }
    const user = await users.execute();
    return user;
  }

  async findById(id: string) {
    const user = await this.tenantDb
      .selectFrom(USERS_TABLE)
      .selectAll()
      .where('id', '=', id)
      .select([
        sql`
          COALESCE(
            (SELECT json_build_object('id', d.id, 'name', d.name)
            FROM departments AS d 
            WHERE d.id = users.department_id),
            '{}'::json
          )
        `.as('department_id'),

        sql`
          COALESCE(
            (SELECT json_build_object('id', l.id, 'name', l.name)
            FROM locations AS l 
            WHERE l.id = users.location_id),
            '{}'::json
          )
        `.as('location_id'),
      ])
      .executeTakeFirst();

    return user ? UserMapper.toDomain(user) : null;
  }
  async findByEmail(email: string): Promise<user.selectable | null> {
    return (await this.tenantDb
      .selectFrom(USERS_TABLE)
      .selectAll()
      .where('email', '=', email)
      .where('deleted_at', 'is', null)
      .executeTakeFirst()) as user.selectable | null;
  }

  async create(createUserDto: CreateUserDto): Promise<user.selectable> {
    let user = UserMapper.toInsertable(createUserDto);
    user = await this.tenantDb
      .insertInto(USERS_TABLE)
      .values(user)
      .returningAll()
      .execute();
    return user ? UserMapper.toDomain(user) : null;
  }

  async update(id: string, userData: user.updateable) {
    const user = await this.tenantDb
      .updateTable(USERS_TABLE)
      .set({ ...userData, updated_at: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow()
      .catch((e) => {
        console.log(e);
      });
    return user ? UserMapper.toDomain(user) : null;
  }

  async updateUsersWithIds(obj, users) {
    return await this.tenantDb
      .updateTable(USERS_TABLE)
      .set({ ...obj, updated_at: new Date() })
      .where('id', 'in', users)
      .execute();
  }

  async delete(id: string): Promise<void> {
    await this.tenantDb.deleteFrom(USERS_TABLE).where('id', '=', id).execute();
  }
  async deletePendingUser(email: string): Promise<void> {
    await this.tenantDb
      .deleteFrom(PENDING_USERS_TABLE)
      .where('email', '=', email)
      .executeTakeFirst();
  }

  async registerPendingUser(inviteEmployeeDto: InviteEmployeeDto) {
    try {
      const userData = PendingUserMapper.toInsertable({ ...inviteEmployeeDto });
      console.log({ userData });
      const user = await this.tenantDb
        .insertInto(PENDING_USERS_TABLE)
        .values(userData)
        .returningAll()
        .executeTakeFirst();
      return user;
    } catch (error) {
      console.error('Error registering pending user:', error);
      throw error;
    }
  }

  async registerPendingOwner(inviteEmployeeDto: InviteEmployeeDto) {
    const userData = PendingUserMapper.toInsertable({ ...inviteEmployeeDto });
    const user = await this.tenantDb
      .insertInto(PENDING_USERS_TABLE)
      .values(userData)
      .returningAll()
      .executeTakeFirst();
    return user;
  }
  async findUserFromPendingUsersByEmail(
    email: string
  ): Promise<pending_users.selectable | null> {
    const user = await this.tenantDb
      .selectFrom(PENDING_USERS_TABLE)
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();
    return user;
  }



  async findUserWithRelations(userId: string, relations: string[] = []) {
    const relationConfig = {
      social: {
        joinQuery: () => sql`
          LEFT JOIN LATERAL (
            SELECT json_agg(
              json_build_object(
                'social_link_type_id', usl.social_link_type_id,
                'link_url', usl.link_url
              )
            ) as social_links
            FROM user_social_links usl 
            WHERE usl.user_id = users.id
          ) social_data ON true
        `,
        selectQuery: () => sql`social_data.social_links as social_links`,
      },
      emergency: {
        joinQuery: () => sql`
          LEFT JOIN LATERAL (
            SELECT json_agg(
              json_build_object(
                'relationship', ec.relationship,
                'mobile_phone', ec.mobile_phone,
                'email', ec.email,
                'address', ec.address
              )
            ) as emergency_contacts
            FROM emergency_contacts ec 
            WHERE ec.user_id = users.id
          ) emergency_data ON true
        `,
        selectQuery: () =>
          sql`emergency_data.emergency_contacts as emergency_contacts`,
      },
      visa: {
        joinQuery: () => sql`
          LEFT JOIN LATERAL (
            SELECT json_agg(
              json_build_object(
                'visa_type', uv.visa_type,
                'status', uv.status,
                'issuing_country', uv.issuing_country,
                'delivery_date', uv.delivery_date,
                'expiration_date', uv.expiration_date,
                'note' , uv.notes

              )
            ) as visas
            FROM user_visa uv 
            WHERE uv.user_id = users.id
          ) visa_data ON true
        `,
        selectQuery: () => sql`visa_data.visas as visas`,
      },
      education: {
        joinQuery: () => sql`
          LEFT JOIN LATERAL (
            SELECT json_agg(
              json_build_object(
                'institution', edu.institution,
                'degree', edu.degree,
                'start_date', edu.start_date,
                'end_date', edu.end_date
              )
            ) as education
            FROM user_education edu 
            WHERE edu.user_id = users.id
          ) education_data ON true
        `,
        selectQuery: () => sql`education_data.education as education`,
      },
      extra_information: {
        joinQuery: () => sql`
          LEFT JOIN user_extra_information uei ON uei.user_id = users.id
        `,
        selectQuery: () => sql`
          uei.allergies as extra_info_allergies,
          uei.dietary_restrictions as extra_info_dietary_restrictions,
          uei.spoken_languages as extra_info_spoken_languages,
          uei.shirt_size as extra_info_shirt_size
        `,
      },
    };

    let joinQueries = sql``;
    let selectQueries = sql``;

    relations.forEach((relation) => {
      const config = relationConfig[relation];
      if (config) {
        joinQueries = sql`${joinQueries} ${config.joinQuery()}`;
        selectQueries = sql`${selectQueries}, ${config.selectQuery()}`;
      }
    });

    const query = await sql`
      SELECT 
        users.*,
        COALESCE(
          (SELECT json_build_object('id', d.id, 'name', d.name)
          FROM departments d 
          WHERE d.id = users.department_id),
          '{}'::json
        ) as department_id,
        COALESCE(
          (SELECT json_build_object('id', l.id, 'name', l.name)
          FROM locations l 
          WHERE l.id = users.location_id),
          '{}'::json
        ) as location_id
        ${selectQueries}
      FROM users
      ${joinQueries}
      WHERE users.id = ${userId}
    `.execute(this.tenantDb);

    return query.rows[0] ? UserMapper.toDomain(query.rows[0]) : [];
  }
  async roleAdmin(name: string): Promise<string | null> {
    const role = await this.tenantDb
      .selectFrom('roles')
      .select('id')
      .where('name', '=', name)
      .executeTakeFirst();

    return role ? role.id : null;
  }
  async departmentAdmin(name: string): Promise<string | null> {
    const department = await this.tenantDb
      .selectFrom('departments')
      .select('id')
      .where('name', '=', name)
      .executeTakeFirst();

    return department ? department.id : null;
  }
  async addWelcomeKit(addWelcomeKitDto: AddWelcomeKitDto, contacts: string[]) {
    const userData = PendingUserMapper.toInsertable({ ...addWelcomeKitDto });
    const contactArray = Array.isArray(contacts) ? contacts : [contacts];
    const result = await this.tenantDb.transaction().execute(async (trx) => {
      await trx
        .updateTable(PENDING_USERS_TABLE)
        .set({ ...userData, updated_at: new Date() })
        .where('email', '=', userData.email)
        .executeTakeFirst();

      if (contactArray?.length > 0) {
        await trx
          .insertInto(EMPLOYEE_CONATCT_TABLE)
          .values(
            contactArray.map((contactId) => ({
              employee_email: addWelcomeKitDto.email,
              contact_id: contactId,
              created_at: new Date(),
              updated_at: new Date(),
            }))
          )
          .onConflict((oc) =>
            oc.columns(['employee_email', 'contact_id']).doUpdateSet({
              updated_at: new Date(),
            })
          )
          .returningAll()
          .execute();
      }

      return await this.getWelcomeKitOfEmployeeByEmail(addWelcomeKitDto.email);
    });

    return result;
  }
  async getWelcomeKitOfEmployeeByEmail(email: string) {
    const welcomeKit = await this.tenantDb
      .selectFrom(PENDING_USERS_TABLE)
      .select([
        'hire_date_welcome',
        'pending_users.arrive_time',
        sql<any>`
        COALESCE(
         (
           SELECT json_agg(
             json_build_object(
               'id', u.id,
               'firstName', u.first_name,
               'lastName' , u.last_name , 
               'email', u.email,
               'phone', u.mobile_phone_number,
               'picture' , u.img_url,
               'department', json_build_object(
                 'id', d.id,
                 'name', d.name
               )
             )
           )
           FROM users AS u
           LEFT JOIN departments AS d ON u.department_id = d.id
           WHERE u.id = pending_users.manager
         ),
         '[]'::json
       )
       `.as('manager'),
        'other_instructions',
        sql<any[]>`
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', u.id,
                'firstName', u.first_name,
                'lastName' , u.last_name , 
                'picture' , u.img_url,

                'email', u.email,
                'department', json_build_object(
                  'id', d.id,
                  'name', d.name
                )
              )
            )
            FROM employee_contacts AS ec
            JOIN users AS u ON ec.contact_id = u.id
            LEFT JOIN departments AS d ON u.department_id = d.id
            WHERE ec.employee_email = ${email}
          ),
          '[]'::json
        )
      `.as('contacts'),
      ])
      .where('pending_users.email', '=', email)
      .executeTakeFirst();

    return welcomeKit ? PendingUserMapper.toDomain(welcomeKit) : {};
  }

  async updateLeaveBalances() {
    await sql`SELECT trigger_leave_balance_update()`.execute(this.tenantDb);

    const results = await sql`
      SELECT 
        u.id, 
        u.first_name as username, 
        u.leave_balance,
        r.annual_leave_days
      FROM users u
      LEFT JOIN roles r ON r.id = u.role_id 
      WHERE u.role_id IS NOT NULL
    `.execute(this.tenantDb);

    return results.rows;
  }
}
