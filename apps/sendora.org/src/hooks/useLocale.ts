import type { Locale } from '@/constants/common';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocaleState {
  locale: Locale;
  setLocale: (newLocale: Locale) => void;
}

export const useLocale = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: 'en-US',
      setLocale: (newLocale) => set({ locale: newLocale }),
    }),
    {
      name: 'useLocale',
    },
  ),
);
