import { Injectable, Inject } from '@nestjs/common';
import { TENANT_DB } from '../../tenants/constants';
import { TenantDatabase } from '../../tenants/database/database';
import { LOCATION } from './location.constants';
import { CreateLocationDto } from './dto/createLocation.dto';
import { UpdateLocationDto } from './dto/updateLocation.dto';
import { LocationMapper, LocationTable } from './interfaces/location.interface';
import { sql } from 'kysely';
import { USERS_TABLE } from '../user/user.constants';
import { QueryBuilderUtility } from '../../common/utils/queryBuilder.util';
import { QueryParams } from '../../common/dto/pagination.dto';
import { LEAVE_TYPE_LOCATIONS } from '../leaveTypeLocations/leaveTypeLocations.constants';

@Injectable()
export class LocationRepository {
  constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase) {}

  async createLocation(createLocation: CreateLocationDto) {
    if (createLocation.users) delete createLocation.users;
    const location = LocationMapper.toInsertable(createLocation);
    return await this.tenantDb
      .insertInto(LOCATION)
      .values(location)
      .returningAll()
      .executeTakeFirst();
  }
  async findAllForStat() {
    const locations = await this.tenantDb
      .selectFrom(LOCATION)
      .select(['id', 'name'])
      .where('deleted_at', 'is', null)
      .execute();
    return locations;
  }

  async findAllLocations(queryParams: QueryParams, offset: number) {
    const { limit, sort, search, filter } = queryParams;
    let query = this.tenantDb
      .selectFrom('locations')
      .where('deleted_at', 'is', null);
    query = QueryBuilderUtility.applyQueryOptions(query, {
      filter,
      allowedFilterFields: [],
      search,
      searchFields: ['locations.name'],
      sort,
      defaultSortField: 'locations.created_at',
      defaultSortOrder: 'asc',
    });

    const countQuery = this.tenantDb
      .selectFrom(query.select('locations.id').as('filtered_locations'))
      .select(sql<number>`count(*)`.as('count'));
    const countResult = await countQuery.executeTakeFirst();

    const locations = await query
      .select((eb) => [
        sql`
        (SELECT COALESCE(json_agg(json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email)),'[]')
         FROM (SELECT id, first_name, last_name, email
               FROM users
               WHERE location_id = locations.id
               ORDER BY created_at ASC
               LIMIT 3) u
        )`.as(USERS_TABLE),

        eb
          .selectFrom(USERS_TABLE)
          .select(sql<number>`count(*)`.as('total_users'))
          .whereRef('location_id', '=', 'locations.id')
          .as('total_users'),
      ])
      .selectAll()
      .offset(offset)
      .limit(limit)
      .execute();

    const total = Number(countResult?.count || 0);

    return {
      total,
      docs: locations
        ? (LocationMapper.toDomain(locations) as LocationTable[])
        : [],
    };
  }

  async findAllLocationsIds() {
    const locations = await this.tenantDb
      .selectFrom(LOCATION)
      .select(['id'])
      .where('deleted_at', 'is', null)
      .execute();
    return locations.map((row) => row.id);
  }

  async findAllLocationsExist(ids: string[]) {
    let locations = await this.tenantDb
      .selectFrom(LOCATION)
      .selectAll()
      .where('id', 'in', ids)
      .where('deleted_at', 'is', null)
      .execute();
    return locations;
  }

  async findLocationById(id: string): Promise<LocationTable | null> {
    const result = await this.tenantDb
      .selectFrom(LOCATION)
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .select([
        sql`
        (SELECT COALESCE(json_agg(json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email)),'[]')
         FROM (SELECT id, first_name, last_name, email
               FROM users
               WHERE location_id = locations.id
               ORDER BY created_at ASC
               LIMIT 3) u
        )`.as('users'),
      ])
      .executeTakeFirst();
    return result ? LocationMapper.toDomain(result) : null;
  }

  async findLocationByName(name: string) {
    const result = await this.tenantDb
      .selectFrom(LOCATION)
      .selectAll()
      .where('name', '=', name)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
    return result ? LocationMapper.toDomain(result) : null;
  }

  async updateLocation(id: string, updateLocationDto: UpdateLocationDto) {
    delete updateLocationDto.users;
    const updatedLocation = LocationMapper.toUpdatable(updateLocationDto);
    const result = await this.tenantDb
      .updateTable(LOCATION)
      .set({ ...updatedLocation, updated_at: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return result ? LocationMapper.toDomain(result) : null;
  }

  async deleteLocation(id: string) {
    await this.tenantDb.transaction().execute(async (trx) => {
      await trx
        .updateTable(LOCATION)
        .set({ deleted_at: new Date(), updated_at: new Date() })
        .where('id', '=', id)
        .executeTakeFirst();
      await trx
        .updateTable(LEAVE_TYPE_LOCATIONS)
        .set({ deleted_at: new Date(), updated_at: new Date() })
        .where('location_id', '=', id)
        .execute();
      await trx
        .updateTable(USERS_TABLE)
        .set({ location_id: null, updated_at: new Date() })
        .where('location_id', '=', id)
        .execute();
    });
  }
}
