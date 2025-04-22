import H1Title from '@/components/h1-title';
import LayoutDefault from '@/components/layout-default';
import { type NetworkInfo, findNetwork, networks } from '@/constants/config';
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

  const network = findNetwork('chainId', slug) ?? networks[0];
  return (
    <LayoutDefault uri="erc20-tokens" network={network}>
      <H1Title>Coming soon</H1Title>
    </LayoutDefault>
  );
}
