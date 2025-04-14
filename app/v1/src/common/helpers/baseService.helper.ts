import { QueryParams } from '../dto/pagination.dto';
import { PaginationUtils } from '../utils/pagination.util';

export class BaseService {
  async getPaginatedData<T>(
    queryParams: QueryParams,
    repositoryMethod: (...args: any[]) => Promise<{ docs: T[]; total: number }>,
    additionalParams: any[] = []
  ) {
    const { page, limit } = PaginationUtils.getPaginationParams(
      queryParams.page,
      queryParams.limit
    );
    const offset = PaginationUtils.calculateOffset(page, limit);



    const { docs, total } = await repositoryMethod(
      ...additionalParams,
      { ...queryParams, limit, page },
      offset
    );

    const meta = PaginationUtils.generateMeta(total, limit, page, offset);
    return { docs, meta };
  }
}
