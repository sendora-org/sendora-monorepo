import AppTitle from '@/components/app-title';
import { App } from '@/features/callit/app';
import LayoutDefault from '@/components/layout-default';
import { type NetworkInfo, findNetwork, networks } from '@/constants/config';
import { composeViemChain } from '@/libs/wagmi';

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
  const { slug } = await params;
  const network = findNetwork('chainId', slug) ?? networks[0];

  const uri = 'callit';
  return (
    <LayoutDefault uri={uri} network={network}>
      <AppTitle
        uri={uri}
        title={'Compose smart contract calls visually'}
        chainId={slug}
      />
      <App network={composeViemChain(network)} />
    </LayoutDefault>
  );
}
