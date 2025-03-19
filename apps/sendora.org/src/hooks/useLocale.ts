import { create } from 'zustand';

type Locale = 'en-US' | 'de-DE' | 'fr-FR' | 'de-CH';

interface LocaleState {
  locale: Locale;
  setLocale: (newLocale: Locale) => void;
}
export const useLocale = create<LocaleState>((set) => ({
  locale: 'en-US',
  setLocale: (newLocale) => set({ locale: newLocale }),
}));
