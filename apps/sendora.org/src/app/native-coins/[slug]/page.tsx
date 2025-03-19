import { TestStep } from '@/components/test-step';
import { TestStep2 } from '@/components/test-step2';

import AppTitle from '@/components/app-title';
import H1Title from '@/components/h1-title';
import H2Title from '@/components/h2-title';
import H3Title from '@/components/h3-title';
import InputNativeCoin from '@/components/input-native-coin';
import LayoutDefault from '@/components/layout-default';
import { type NetworkInfo, findNetwork, networks } from '@/constants/config';
import { getVisitorId } from '@/libs/common';

import ConnectButton from '@/components/connect-button';
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

  const network = findNetwork('chainId', slug);

  return (
    <LayoutDefault>
      <>
        <AppTitle
          title={`Send ${network?.symbol} to multiple recipients`}
          chainId={slug}
        />
        <TestStep />
        <InputNativeCoin />
        <ConnectButton />
      </>
    </LayoutDefault>
  );
}
