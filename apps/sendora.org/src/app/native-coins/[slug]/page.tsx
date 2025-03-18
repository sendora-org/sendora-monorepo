import { TestStep } from '@/components/test-step';
import { TestStep2 } from '@/components/test-step2';

import H1Title from '@/components/h1-title';
import H2Title from '@/components/h2-title';
import H3Title from '@/components/h3-title';
import InputNativeCoin from '@/components/input-native-coin';
import LayoutDefault from '@/components/layout-default';
import { getVisitorId } from '@/libs/common';
import { ConnectButton } from '@rainbow-me/rainbowkit';
export async function generateStaticParams() {
  return [1, 56].map((chainId) => ({
    slug: chainId.toString(),
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <LayoutDefault>
      <>
        <H1Title>Send ETH to multiple recipients</H1Title>
        <TestStep />
        <InputNativeCoin />
      </>
    </LayoutDefault>
  );
}
