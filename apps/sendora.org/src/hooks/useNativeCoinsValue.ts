import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface NativeCoinsValue {
  value: string;
  setValue: (newValue: string) => void;
}

export const useNativeCoinsValue = create<NativeCoinsValue>()((set, get) => ({
  value: '',
  setValue: (newValue) => set({ value: newValue }),
}));
