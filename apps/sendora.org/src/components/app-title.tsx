'use client';
import H1Title from '@/components/h1-title';
import SelectNetworks from '@/components/select-networks';
import { useRouter } from 'next/navigation';

export default ({ title, chainId }: { title: string; chainId: string }) => {
  const router = useRouter();
  return (
    <div className="w-full  gap-1 flex flex-col  sm:flex-row sm:justify-between items-center mb-4 sm:mb-8">
      <H1Title>{title}</H1Title>
      <SelectNetworks
        navigate={(chainId) => {
          router.push(`/native-coins/${chainId}`);
        }}
        defaultSelectedKeys={[chainId]}
      />
    </div>
  );
};
