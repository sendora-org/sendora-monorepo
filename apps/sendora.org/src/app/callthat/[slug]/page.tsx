import LayoutDefault from '@/components/layout-default';
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
  // Example usage:
  console.log(parseLocalizedNumber('1.234,56', ',', ['.'])); // 1234.56 (German Format)
  console.log(parseLocalizedNumber("1'234.56", '.', ["'"])); // 1234.56 (Swiss Format)
  console.log(parseLocalizedNumber('1 234,56', ',', [' '])); // 1234.56 (French Format)
  console.log(parseLocalizedNumber('11231232 34,56', ',', [' ']));
  const { slug } = await params;

  return (
    <LayoutDefault>
      <div>My Post: {slug}</div>
    </LayoutDefault>
  );
}
