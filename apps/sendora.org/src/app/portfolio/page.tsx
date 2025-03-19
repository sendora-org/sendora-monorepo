import H1Title from '@/components/h1-title';
import LayoutDefault from '@/components/layout-default';
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <LayoutDefault>
      <H1Title>Coming soon</H1Title>
    </LayoutDefault>
  );
}
