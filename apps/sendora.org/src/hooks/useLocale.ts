import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type Locale = 'en-US' | 'de-DE' | 'fr-FR' | 'de-CH';

interface LocaleState {
  locale: Locale;
  setLocale: (newLocale: Locale) => void;
}
// export const useLocale = create<LocaleState>((set) => ({
//   locale: 'en-US',
//   setLocale: (newLocale) => set({ locale: newLocale }),
// }));

export const useLocale = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: 'en-US',
      setLocale: (newLocale) => set({ locale: newLocale }),
    }),
    {
      name: 'number-format',
    },
  ),
);
