import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface CurrencyStore {
  codes: string[];
  selectedCode: string;
  addCode: (code: string) => void;
  removeCode: (code: string) => void;
  clearCodes: () => void;
  setCode: (code: string) => void;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      codes: [],
      selectedCode: 'USD',
      setCode: (code: string) => {
        set({ selectedCode: code });
      },

      addCode: (code) => {
        const normalized = code.toUpperCase();
        const exists = get().codes.includes(normalized);
        if (!exists) {
          set((state) => ({ codes: [...state.codes, normalized] }));
        }
      },

      removeCode: (code) => {
        const normalized = code.toUpperCase();
        set((state) => ({
          codes: state.codes.filter((c) => c !== normalized),
        }));
      },

      clearCodes: () => {
        set({ codes: [] });
      },
    }),
    {
      name: 'useCurrencyStore',
    },
  ),
);
