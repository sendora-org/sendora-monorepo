import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import { TestStep } from '@/components/test-step';
import { TestStep2 } from '@/components/test-step2';

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
    <div className="relative flex h-screen min-h-dvh w-full flex-col overflow bg-background">
      <Navbar />
      <main className="container mx-auto mt-[80px] flex max-w-[1024px] flex-col items-start px-8">
        <div>ChainID: {slug}</div>

        <TestStep />
        <TestStep />
        <TestStep2 />
      </main>
      <div className="mt-[450px] md:mt-[650px]">
        <Footer />
      </div>
    </div>
  );
}
