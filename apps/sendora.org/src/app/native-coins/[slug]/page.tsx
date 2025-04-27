import AppTitle from '@/components/app-title';
import LayoutDefault from '@/components/layout-default';
import { App } from '@/features/native-coins/app';
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
  const uri = 'native-coins';
  const { slug } = await params;
  const network = findNetwork('chainId', slug) ?? networks[0];
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
