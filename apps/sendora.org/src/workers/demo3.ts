// @ts-ignore
importScripts('/jslib/taffy-2.7.3-min.js');

// @ts-ignore
let db = TAFFY();

// biome-ignore  lint/suspicious/noExplicitAny: reason
self.onmessage = (event: MessageEvent<any>) => {
  const { type, payload } = event.data;
  handle(type, payload);
  // postMessage(result);
};

// biome-ignore  lint/suspicious/noExplicitAny: reason
function handle(type: any, payload: any): any {
  switch (type) {
    case 'initialize': {
      // @ts-ignore
      db = TAFFY(payload);
      postMessage({ type: 'initialized', success: true });
      break;
    }

    case 'query': {
      const {
        filter,
        sortField = 'id',
        sortOrder = 'asec',
        searchKey,
        searchField,
        sumField,
        page = 1,
        pageSize = 10,
      } = payload;
      let result = db();

      console.log({
        filter,
        sortField,
        sortOrder,
        searchKey,
        searchField,
        page,
        pageSize,
      });

      const start = (page - 1) * pageSize;

      // Search
      if (searchKey && searchField) {
        console.log({ searchKey, searchField });
        result = result.filter({
          [searchField]: { like: searchKey },
        });
      }

      // Filter
      if (filter) {
        console.log({ filter });
        result = result.filter(filter);
      }

      // Sort
      if (sortField) {
        console.log({ sortField });
        result = result.order(`${sortField} ${sortOrder}`);
      }

      // Pagination
      const paginatedResult = result.start(start).limit(pageSize).get();

      let sumValue = 0;
      // SUM
      if (sumField) {
        console.log({ sumField });
        sumValue = result.sum(sumField);
      }

      // totalRecords
      // const totalRecords = result.count();
      const returns = {
        type: 'query_result',
        data: paginatedResult,
        sumValue,
        pagination: {
          page,
          pageSize,
          totalRecords: 10000,
          totalPages: 100, //Math.ceil(totalRecords / pageSize),
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
