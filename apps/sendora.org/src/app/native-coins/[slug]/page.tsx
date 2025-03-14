import { TestStep } from '@/components/test-step';
import { TestStep2 } from '@/components/test-step2';

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
        <ConnectButton />
        <div>ChainID: {slug}</div>
        <TestStep />
        <TestStep />
        <TestStep2 />
      </>
    </LayoutDefault>
  );
}
