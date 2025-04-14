export class PaginationMeta {
  total: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage?: number;
  nextPage?: number;
  hasMore: boolean;

  constructor(total: number, limit: number, page: number, offset: number) {
    this.total = total;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.page = page;
    this.pagingCounter = offset + 1;
    this.hasPrevPage = page > 1;
    this.hasNextPage = page < this.totalPages;
    this.prevPage = this.hasPrevPage ? page - 1 : undefined;
    this.nextPage = this.hasNextPage ? page + 1 : undefined;
    this.hasMore = page < this.totalPages;
  }
}
