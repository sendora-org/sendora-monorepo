// biome-ignore  lint/suspicious/noExplicitAny: reason
self.onmessage = async (event: MessageEvent<any>) => {
  const { type, payload } = event.data;
  handle(type, payload);
};

let mydb: never[] = [];
// @ts-ignore
import orderBy from 'lodash.orderby';
// biome-ignore  lint/suspicious/noExplicitAny: reason
async function handle(type: any, payload: any): Promise<any> {
  switch (type) {
    case 'initialize': {
      mydb = payload;
      postMessage({ type: 'initialized', success: true });

      break;
    }

    case 'query': {
      const {
        filter,
        sortField = 'id',
        sortOrder = 'asc',
        searchKey,
        searchField,
        sumField,
        page = 1,
        pageSize = 10,
      } = payload;
      // biome-ignore  lint/suspicious/noExplicitAny: reason
      let result: any = [];

      console.log({
        filter,
        sortField,
        sortOrder,
        searchKey,
        searchField,
        page,
        pageSize,
      });

      //   // Search
      //   if (searchKey && searchField) {
      //     console.log({ searchKey, searchField });
      //     result = result.filter({
      //       [searchField]: { like: searchKey },
      //     });
      //   }

      //   // Filter
      //   if (filter) {
      //     console.log({ filter });

      //   }

      // Sort
      if (sortField) {
        console.log({ sortField });
        // result = orderBy(mydb, [sortField], [sortOrder]);

        result = mydb.sort((a, b) => {
          const first = a[sortField];
          const second = b[sortField];
          const cmp = first < second ? -1 : first > second ? 1 : 0;
          return sortOrder === 'desc' ? -cmp : cmp;
        });
      }

      // Pagination
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedResult = result.slice(start, end);

      // totalRecords
      const totalRecords = result.length;
      const returns = {
        type: 'query_result',
        data: paginatedResult,
        // sumValue,
        pagination: {
          page,
          pageSize,
          totalRecords: totalRecords,
          totalPages: Math.ceil(totalRecords / pageSize),
        },
      };

      postMessage(returns);
      break;
    }

    // case 'delete':
    //   if (payload.all) {
    //     db = TAFFY();
    //   } else if (Array.isArray(payload.ids)) {
    //     db((item) => payload.ids.includes(item.id)).remove();
    //   }
    //   postMessage({ type: 'deleted', success: true });
    //   break;

    // case 'update':
    //   if (payload.id && payload.data) {
    //     db({ id: payload.id }).update(payload.data);
    //   }
    //   postMessage({ type: 'updated', success: true });
    //   break;

    default:
      postMessage({ type: 'error', message: 'Unknown command' });
  }
}
