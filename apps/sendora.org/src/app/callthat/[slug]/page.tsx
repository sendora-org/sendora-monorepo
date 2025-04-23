import AppTitle from '@/components/app-title';
import { App } from '@/components/callthat/app';
import H1Title from '@/components/h1-title';
import LayoutDefault from '@/components/layout-default';
import WebWorkerDemo1 from '@/components/web-worker-demo1';
import { type NetworkInfo, findNetwork, networks } from '@/constants/config';
import {
  formatLocalizedNumberWithSmallNumbers,
  formatSmallNumber,
  parseLocalizedNumber,
} from '@/libs/common';
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

  const uri = 'callthat';
  return (
    <LayoutDefault uri={uri} network={network}>
      {/* <H1Title>Coming soon</H1Title> */}

      <AppTitle
        uri={uri}
        title={`Call contract on ${network?.name}`}
        chainId={slug}
      />
      <App network={composeViemChain(network)} />
    </LayoutDefault>
  );
}
