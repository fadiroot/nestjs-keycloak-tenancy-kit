export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
  }
  
  export interface PaginatedResponse<T> {
    docs: T[];
    meta: PaginationMeta;
  }