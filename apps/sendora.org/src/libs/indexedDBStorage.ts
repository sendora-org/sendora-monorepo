import { del, get, set } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

export function createIndexedDBStorage(dbKey = 'zustand_rpcs') {
  return {
    getItem: async (name: string) => {
      const value = await get(`${dbKey} - ${name}`);
      return value ?? null;
    },
    // biome-ignore  lint/suspicious/noExplicitAny: reason
    setItem: async (name: string, value: any) => {
      await set(`${dbKey} - ${name}`, value);
    },
    removeItem: async (name: string) => {
      await del(`${dbKey} - ${name}`);
    },
  };
}
