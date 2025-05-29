'use client';
import AppTitle from '@/components/app-title';
import LayoutDefault from '@/components/layout-default';
import { type NetworkInfo, findNetwork, networks } from '@/constants/config';
import { App } from '@/features/native-coins/app';
import { composeViemChain } from '@/libs/wagmi';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const uri = 'native-coins';
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') ?? '';
  // const network = findNetwork('chainId', slug) ?? networks[0];

  const network = useMemo(() => {
    // window.localeStorage.setItem('chainId', slug);
    return findNetwork('chainId', slug) ?? networks[0];
  }, [slug]);
  console.log('native-coin', slug);
  return (
    <LayoutDefault uri={uri} network={network}>
      <AppTitle
        uri={uri}
        title={`Send ${network?.symbol} to multiple recipients`}
        chainId={slug}
      />

      <App network={composeViemChain(network)} />
    </LayoutDefault>
  );
}
