import { PaginationMeta } from '../models/pagination.model';

export class PaginationUtils {
  static getPaginationParams(page: number, limit: number) {
    page = page && page > 0 ? page : 1;
    limit = limit && limit > 0 && limit <= 100 ? limit : 10;
    return {
      page,
      limit,
    };
  }

  static calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  static generateMeta(
    total: number,
    limit: number,
    page: number,
    offset: number
  ): PaginationMeta {
    return new PaginationMeta(total, limit, page, offset);
  }
}
