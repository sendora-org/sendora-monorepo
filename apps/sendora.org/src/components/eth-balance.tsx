import { useRpcStore } from '@/hooks/useRpcStore';
import { createPublicClientWithRpc } from '@/libs/common';
import React from 'react';
import useSWR from 'swr';
import type { Chain, Hex } from 'viem';
import { http, createPublicClient, formatEther } from 'viem';

const fetchBalance = async ({
  address,
  chain,
  rpcUrl,
}: { address: Hex; chain: Chain; rpcUrl: string }) => {
  const client = await createPublicClientWithRpc(chain.id, rpcUrl);

  if (!address) throw new Error('The address cannot be empty.');
  const balanceWei = await client.getBalance({ address });
  return (+formatEther(balanceWei)).toFixed(4);
};

const ETHBalance = ({
  address,
  chain,
}: { address: Hex; chain: Chain; suffix?: string }) => {
  const { activeRpc } = useRpcStore();

  const { data: balance, error } = useSWR(
    { address, chain, rpcUrl: activeRpc[chain.id] },
    fetchBalance,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    },
  );

  if (error || balance === undefined) {
    return <></>;
  }

  return (
    <>
      {balance} {chain.nativeCurrency.symbol}
    </>
  );
};

export default ETHBalance;
