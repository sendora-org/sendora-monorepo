'use client';

import { useLocale } from '@/hooks/useLocale';
import { HeroUIProvider } from '@heroui/react';

export function Providers({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  return <HeroUIProvider locale={locale}>{children}</HeroUIProvider>;
}
