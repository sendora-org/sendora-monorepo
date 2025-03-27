import H1Title from '@/components/h1-title';
import LayoutDefault from '@/components/layout-default';
import WebWorkerDemo1 from '@/components/web-worker-demo1';
import {
  formatLocalizedNumberWithSmallNumbers,
  formatSmallNumber,
  parseLocalizedNumber,
} from '@/libs/common';
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
    <LayoutDefault uri="callthat">
      <H1Title>Coming soon</H1Title>
    </LayoutDefault>
  );
}
