interface Item {
  id: number;
  raw: string;

  // biome-ignore  lint/suspicious/noExplicitAny: reason
  [key: string]: any;
}

export class DataManager<T extends Item> {
  private dataMap: Map<number, T>;
  private idIndex: number[];

  constructor(initialData: T[] = []) {
    this.dataMap = new Map<number, T>();
    this.idIndex = [];
    this.reset(initialData);
  }

  reset(data: T[]): void {
    this.dataMap.clear();
    this.idIndex = [];

    console.log('reset', data.length);
    for (const item of data) {
      this.dataMap.set(item.id, item);
      this.idIndex.push(item.id);
    }
  }

  delete(id: number): boolean {
    const success = this.dataMap.delete(id);
    if (success) {
      const index = this.idIndex.indexOf(id);
      if (index !== -1) this.idIndex.splice(index, 1);
    }
    return success;
  }

  update(id: number, data: Partial<T>): boolean {
    const existingItem = this.dataMap.get(id);
    if (!existingItem) return false;
    const updatedItem = { ...existingItem, ...data };
    this.dataMap.set(id, updatedItem);
    return true;
  }

  create(item: T): void {
    if (!this.dataMap.has(item.id)) {
      this.dataMap.set(item.id, item);
      this.idIndex.push(item.id);
    }
  }

  query(
    options: {
      sortField?: keyof T;
      sortOrder?: 'asc' | 'desc';
      filter?: (item: T) => boolean;
      searchKey?: string;
      searchFields?: (keyof T)[];
      page?: number;
      pageSize?: number;
    } = {},
  ): {
    items: T[];
    total: number;
  } {
    console.log({ options });

    const {
      sortField,
      sortOrder = 'asc',
      filter,
      searchKey,
      searchFields,
      page = 1,
      pageSize = 10,
    } = options;

    //
    let ids = [...this.idIndex];

    // Fiter
    if (filter || (searchKey && searchFields)) {
      ids = ids.filter((id) => {
        // biome-ignore lint/style/noNonNullAssertion: reason
        const item = this.dataMap.get(id)!;
        if (filter && !filter(item)) return false;
        if (searchKey && searchFields) {
          const searchLower = searchKey.toLowerCase();
          return searchFields.some((field) =>
            String(item[field]).toLowerCase().includes(searchLower),
          );
        }
        return true;
      });
    }

    // Sort
    if (sortField) {
      ids.sort((a, b) => {
        // biome-ignore lint/style/noNonNullAssertion: reason
        const itemA = this.dataMap.get(a)!;
        // biome-ignore lint/style/noNonNullAssertion: reason
        const itemB = this.dataMap.get(b)!;
        const first = itemA[sortField];
        const second = itemB[sortField];

        const cmp = first < second ? -1 : first > second ? 1 : 0;
        return sortOrder === 'desc' ? -cmp : cmp;
      });
    }

    // Count
    const total = ids.length;

    // Page
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    const paginatedIds = ids.slice(start, end);

    // biome-ignore lint/style/noNonNullAssertion: reason
    const items = paginatedIds.map((id) => this.dataMap.get(id)!);

    return { items, total };
  }

  get(id: number): T | undefined {
    return this.dataMap.get(id);
  }
  getAll(): T[] {
    const ids = [...this.idIndex];
    console.log(this.dataMap);
    // biome-ignore lint/style/noNonNullAssertion: reason
    return ids.map((id) => this.dataMap.get(id)!);
  }
  getIdIndex(): number[] {
    return this.idIndex;
  }
}
