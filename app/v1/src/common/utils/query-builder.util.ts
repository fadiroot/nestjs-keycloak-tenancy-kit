import { SelectQueryBuilder, sql } from 'kysely';

export class QueryBuilder<DB, TB extends keyof DB> {
  constructor(private query: SelectQueryBuilder<DB, TB, any>) {}

  applySearch(search: string, searchFields: string[]) {
    if (!search || !searchFields.length) return this;

    const searchCondition = searchFields
      .map((field) => sql`LOWER(${sql.ref(field)}) LIKE ${`%${search.toLowerCase()}%`}`)
      .reduce((acc, condition) => (acc ? sql`${acc} OR ${condition}` : condition), undefined as any);

    if (searchCondition) {
      this.query = this.query.where(searchCondition);
    }

    return this;
  }

  applySort(sortBy?: string, sortOrder: 'asc' | 'desc' = 'asc') {
    if (sortBy) {
      this.query = this.query.orderBy(sortBy, sortOrder);
    }
    return this;
  }

  applyFilter(filter: Record<string, any>) {
    if (!filter) return this;

    Object.entries(filter).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        this.query = this.query.where(sql.ref(key), 'in', value);
      } else if (value !== undefined && value !== null) {
        this.query = this.query.where(sql.ref(key), '=', value);
      }
    });
    return this;
  }

  applySelect(select?: any) {
    if (select?.length) {
      this.query = this.query.select(select);
    } else {
      this.query = this.query.selectAll();
    }
    return this;
  }

  getQuery() {
    return this.query;
  }
}
