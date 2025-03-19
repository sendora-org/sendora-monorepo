import InputExchangeRate from '@/components/input-exchange-rate';
import { TestStep } from '@/components/test-step';
import { TestStep2 } from '@/components/test-step2';

import AppTitle from '@/components/app-title';
import ConnectButton from '@/components/connect-button';
import H1Title from '@/components/h1-title';
import H2Title from '@/components/h2-title';
import H3Title from '@/components/h3-title';
import InputNativeCoin from '@/components/input-native-coin';
import LayoutDefault from '@/components/layout-default';
import { SIWEProvider } from '@/components/siwe-provider';
import { type NetworkInfo, findNetwork, networks } from '@/constants/config';
import { getVisitorId } from '@/libs/common';
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

  return (
    <LayoutDefault chain={composeViemChain(network)}>
      <AppTitle
        title={`Send ${network?.symbol} to multiple recipients`}
        chainId={slug}
      />
      <TestStep />
      <InputNativeCoin />

      <InputExchangeRate symbol={network?.symbol} />
      <ConnectButton />
    </LayoutDefault>
  );
}
