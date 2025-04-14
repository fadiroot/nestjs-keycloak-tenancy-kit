import { camelToSnake } from './camelToSnake.util';

interface QueryOptions {
  filter?: Record<string, string>;
  allowedFilterFields?: string[];
  search?: string;
  searchFields?: string[];
  sort?: string;
  defaultSortField?: string;
  defaultSortOrder?: 'asc' | 'desc';
}

export class QueryBuilderUtility {
  static applyFilters<T>(
    query: any,
    filter?: Record<string, any>,
    allowedFilterFields: string[] = []
  ) {
    if (filter) {
      const snakeCasedFilter = Object.fromEntries(
        Object.entries(filter).map(([key, value]) => [camelToSnake(key), value])
      );
      const filterKeys =
        allowedFilterFields.length > 0
          ? Object.keys(snakeCasedFilter).filter((key) => {
              const dbField = allowedFilterFields.find((allowedField) =>
                allowedField.endsWith(`.${key}`)
              );
              if (!dbField) {
                throw new Error(`Filtering on field "${key}" is not allowed.`);
              }
              return dbField;
            })
          : Object.keys(snakeCasedFilter);

      filterKeys.forEach((key) => {
        const dbField =
          allowedFilterFields.find((allowedField) =>
            allowedField.endsWith(`.${key}`)
          ) || key;

        const value = snakeCasedFilter[key];

        if (typeof value === 'string' || typeof value === 'number') {
          query = query.where(dbField, '=', value);
        } else if (typeof value === 'object' && value !== null) {
          Object.keys(value).forEach((operator) => {
            switch (operator) {
              case 'lt':
                query = query.where(dbField, '<', value[operator]);
                break;
              case 'lte':
                query = query.where(dbField, '<=', value[operator]);
                break;
              case 'gt':
                query = query.where(dbField, '>', value[operator]);
                break;
              case 'gte':
                query = query.where(dbField, '>=', value[operator]);
                break;
              case 'neq':
                query = query.where(dbField, '<>', value[operator]);
                break;
              case 'in':
                query = query.where(dbField, 'in', value[operator]);
                break;
              case 'notIn':
                query = query.where(dbField, 'not in', value[operator]);
                break;
              case 'eq':
                query = query.where(dbField, '=', value[operator]);
                break;
              default:
                throw new Error(`Unsupported filter operator: ${operator}`);
            }
          });
        }
      });
    }
    return query;
  }

  static applySearch<T>(query: any, search?: string, searchFields?: string[]) {
    if (search && searchFields && searchFields.length > 0) {
      query = query.where((eb) =>
        eb.or(
          searchFields.map((field) =>
            eb(camelToSnake(field) as any, 'ilike', `%${search}%`)
          )
        )
      );
    }
    return query;
  }

  static applySorting<T>(
    query: any,
    sort?: string,
    defaultSortField = 'created_at',
    defaultSortOrder: 'asc' | 'desc' = 'asc'
  ) {
    if (sort) {
      const sortOrder = sort[0] === '-' ? 'desc' : 'asc';
      const sortField = sort[0] === '-' ? sort.slice(1) : sort;
      query = query.orderBy(sortField as any, sortOrder);
    } else {
      query = query.orderBy(
        camelToSnake(defaultSortField) as any,
        defaultSortOrder
      );
    }
    return query;
  }

  static applyQueryOptions<T>(query: any, options: QueryOptions) {
    query = QueryBuilderUtility.applyFilters(
      query,
      options.filter,
      options.allowedFilterFields
    );
    query = QueryBuilderUtility.applySearch(
      query,
      options.search,
      options.searchFields
    );
    query = QueryBuilderUtility.applySorting(
      query,
      options.sort,
      options.defaultSortField,
      options.defaultSortOrder
    );
    return query;
  }
}
