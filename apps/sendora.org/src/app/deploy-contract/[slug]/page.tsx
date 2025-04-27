import AppTitle from '@/components/app-title';
import LayoutDefault from '@/components/layout-default';
import { type NetworkInfo, findNetwork, networks } from '@/constants/config';
import { App } from '@/features/deploy-contract/app';
import { useRpcStore } from '@/hooks/useRpcStore';
import { getActiveRpc } from '@/libs/common';
import { composeViemChain } from '@/libs/wagmi';
import { useEffect } from 'react';
export async function generateStaticParams() {
  return networks.map((network: NetworkInfo) => ({
    slug: network.chainId,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const uri = 'deploy-contract';
  const { slug } = await params;

  const network = findNetwork('chainId', slug) ?? networks[0];

  return (
    <LayoutDefault
      uri={uri}
      network={network}
      chain={composeViemChain(network)}
    >
      <AppTitle
        uri={uri}
        title={`Deploy contract on ${network?.name}`}
        chainId={slug}
      />
      <App network={composeViemChain(network)} />
    </LayoutDefault>
  );
}
