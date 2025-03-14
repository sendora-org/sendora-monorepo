import LayoutDefault from '@/components/layout-default';

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
      <div>My Post: {slug}</div>
    </LayoutDefault>
  );
}
