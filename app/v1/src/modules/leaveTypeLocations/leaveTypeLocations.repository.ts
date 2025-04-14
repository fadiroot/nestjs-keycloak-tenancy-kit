import { Inject } from '@nestjs/common';
import { TENANT_DB } from '../../tenants/constants';
import { TenantDatabase } from '../../tenants/database/database';
import { LeaveTypeLocationMapper } from './interfaces/leaveTypeLocation.interface';
import { CreateLeaveTypeLocationDto } from './dto/createLeaveTypeLocation.dto';
import { LEAVE_TYPE_LOCATIONS } from './leaveTypeLocations.constants';
import { UpdateLeaveTypeLocationDto } from './dto/updateLeaveTypeLocation.dto';
import { sql } from 'kysely';
import { QueryBuilderUtility } from '../../common/utils/queryBuilder.util';
import { QueryParams } from '../../common/dto/pagination.dto';

export class LeaveTypeLocationsRepository {
  constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase) {}

  async createLeaveTypeLocations(
    leaveTypeLocationsDto: CreateLeaveTypeLocationDto[]
  ) {
    leaveTypeLocationsDto = LeaveTypeLocationMapper.toInsertable(
      leaveTypeLocationsDto
    );
    const leaveTypeLocations = await this.tenantDb
      .insertInto(LEAVE_TYPE_LOCATIONS)
      .values(leaveTypeLocationsDto)
      .returningAll()
      .execute();

    return LeaveTypeLocationMapper.toDomain(leaveTypeLocations);
  }

  async findAllLeaveTypeLocations(
    leaveTypeId: string,
    queryParams: QueryParams,
    offset: number
  ) {
    const { limit, sort, search, filter } = queryParams;

    let query = this.tenantDb
      .selectFrom(LEAVE_TYPE_LOCATIONS)
      .innerJoin(
        'locations',
        'locations.id',
        'leave_type_locations.location_id'
      )
      .select([
        'leave_type_locations.leave_type_id',
        'leave_type_locations.created_at',
        'leave_type_locations.updated_at',
        'leave_type_locations.deleted_at',
      ])
      .where('leave_type_locations.deleted_at', 'is', null)
      .where('leave_type_locations.leave_type_id', '=', leaveTypeId);

    query = QueryBuilderUtility.applyQueryOptions(query, {
      filter,
      allowedFilterFields: [],
      search,
      searchFields: ['locations.name'],
      sort,
      defaultSortField: 'leave_type_locations.created_at',
      defaultSortOrder: 'asc',
    });

    const countQuery = this.tenantDb
      .selectFrom(
        query
          .select('leave_type_locations.leave_type_id')
          .as('filtered_leave_type_locations')
      )
      .select(sql<number>`count(*)`.as('count'));
    const countResult = await countQuery.executeTakeFirst();

    const docs = await query
      .select([
        sql`
      (SELECT COALESCE(row_to_json(l), '{}')
       FROM locations AS l
       WHERE l.id = leave_type_locations.location_id 
       AND l.deleted_at IS NULL
       LIMIT 1
      )`.as('locations'),
      ])
      .offset(offset)
      .limit(limit)
      .execute();

    const total = Number(countResult?.count || 0);

    return {
      docs: docs ? LeaveTypeLocationMapper.toDomain(docs) : [],
      total,
    };
  }

  async findLeaveTypeLocationByLeaveTypeId(leaveTypeId: string) {
    const result = await this.tenantDb
      .selectFrom(LEAVE_TYPE_LOCATIONS)
      .where('leave_type_id', '=', leaveTypeId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return result ? LeaveTypeLocationMapper.toDomain(result) : null;
  }

  async findLeaveTypeLocationByObj(
    leaveTypeLocation: CreateLeaveTypeLocationDto
  ) {
    const result = await this.tenantDb
      .selectFrom(LEAVE_TYPE_LOCATIONS)
      .innerJoin(
        'locations',
        'locations.id',
        'leave_type_locations.location_id'
      )
      .select([
        'leave_type_locations.leave_type_id',
        'leave_type_locations.created_at',
        'leave_type_locations.updated_at',
        'leave_type_locations.deleted_at',
      ])
      .select((eb) => [
        sql`
      (SELECT COALESCE(row_to_json(l), '{}')
       FROM locations AS l
       WHERE locations.id = leave_type_locations.location_id
       LIMIT 1
      )`.as('locations'),
      ])
      .where('leave_type_locations.deleted_at', 'is', null)
      .where((eb: any) =>
        eb.and({
          location_id: leaveTypeLocation.locationId,
          leave_type_id: leaveTypeLocation.leaveTypeId,
        })
      )
      .executeTakeFirst();

    return result ? LeaveTypeLocationMapper.toDomain(result) : null;
  }

  async findAllLeaveTypeLocationsExist(
    createLeaveTypeApproversDto: CreateLeaveTypeLocationDto[]
  ) {
    const leaveTypeLocations = LeaveTypeLocationMapper.toInsertable(
      createLeaveTypeApproversDto
    );
    const locationIds = leaveTypeLocations.map((item) => item.location_id);
    const result = await this.tenantDb
      .selectFrom(LEAVE_TYPE_LOCATIONS)
      .selectAll()
      .where('location_id', 'in', locationIds)
      .where('leave_type_id', '=', createLeaveTypeApproversDto[0].leaveTypeId)
      .where('deleted_at', 'is', null)
      .execute();
    return result ? LeaveTypeLocationMapper.toDomain(result) : null;
  }

  async updateLeaveTypeLocation(
    leaveTypeId: string,
    locationId: string,
    updateLeaveTypeLocationDto: UpdateLeaveTypeLocationDto
  ) {
    let updatedLeaveTypeLocation = LeaveTypeLocationMapper.toUpdatable(
      updateLeaveTypeLocationDto
    );
    updatedLeaveTypeLocation = await this.tenantDb
      .updateTable(LEAVE_TYPE_LOCATIONS)
      .set({ ...updatedLeaveTypeLocation, updated_at: new Date() })
      .where('leave_type_id', '=', leaveTypeId)
      .where('location_id', '=', locationId)
      .returningAll()
      .executeTakeFirst();

    return updatedLeaveTypeLocation
      ? LeaveTypeLocationMapper.toDomain(updatedLeaveTypeLocation)
      : null;
  }

  async deleteLeaveTypeLocation(leaveTypeId: string, locationId: string) {
    return await this.tenantDb
      .updateTable(LEAVE_TYPE_LOCATIONS)
      .set({ deleted_at: new Date(), updated_at: new Date() })
      .where('leave_type_id', '=', leaveTypeId)
      .where('location_id', '=', locationId)
      .executeTakeFirst();
  }
}
