import LayoutDefault from '@/components/layout-default';

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
