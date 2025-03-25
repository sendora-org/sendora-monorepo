import type { SortDescriptor } from '@heroui/react';
import { runWorker3 } from './common';

type IResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
};

export const queryItems = async <T>(
  worker: Worker | null,
  page = 1,
  pageSize = 100,
  sortDescriptor?: SortDescriptor,
  searchKey?: string,
  sumField?: string,
  filter?: unknown,
): Promise<IResponse<T>> => {
  if (worker) {
    let sortField = 'id';
    let sortOrder = 'asc';

    if (sortDescriptor) {
      sortField = sortDescriptor.column as string;
      sortOrder = sortDescriptor.direction === 'ascending' ? 'asc' : 'desc';
    }
    const queryPayload = {
      type: 'query',
      payload: {
        searchField: 'name',
        searchKey: searchKey,
        sortField: sortField ?? 'id',
        sortOrder: sortOrder,
        page: page,
        pageSize: pageSize,
        filter,
        sumField: sumField,
      },
    };

    const queryResult = await runWorker3(worker, 'query_result', queryPayload);

    return queryResult as IResponse<T>;
  }
  return {
    data: [],
    pagination: { page: 1, pageSize: 1, totalRecords: 0, totalPages: 1 },
  };
};
