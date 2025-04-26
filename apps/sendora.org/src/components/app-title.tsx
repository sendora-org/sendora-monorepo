'use client';
import H1Title from '@/components/h1-title';
import SelectNetworks from '@/components/select-networks';
import { useRouter } from 'next/navigation';

export default ({
  title,
  chainId,
  uri,
}: { title: string; chainId: string; uri: string }) => {
  const router = useRouter();
  return (
    <div className="w-full  gap-1 flex flex-col   md:flex-row md:justify-between md:items-center mb-4 md:mb-8">
      <H1Title>{title}</H1Title>
      <SelectNetworks
        navigate={(chainId) => {
          router.push(`/${uri}/${chainId}`);

          // @ts-ignore
          window?.stonks?.event(`${uri}-change-chain`, { chainId });
        }}
        defaultSelectedKeys={[chainId]}
      />
    </div>
  );
};
