'use client';
import ConnectButton from '@/components/connect-button';
import H3Title from '@/components/h3-title';
import useAuthStore from '@/hooks/useAuth';
import { sendRawTransaction, waitForTransactionReceipt } from '@/libs/common';
import { Button, Textarea } from '@heroui/react';
import React, { useState } from 'react';
import type { Chain, Hex } from 'viem';
import { useAccount } from 'wagmi';

type Iprops = {
  network: Chain;
};

export const Arbitrage = ({ network }: Iprops) => {
  const { isConnected, chain, chainId, address } = useAccount();
  const { status, loginAddress } = useAuthStore();
  const [signedRawTxn, setSignedRawTxn] = useState<string>('');

  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col gap-2 w-full">
      <H3Title>
        Signed Raw Transaction <span className="text-red-600">*</span>
      </H3Title>
      <Textarea
        className="mb-4"
        isClearable
        defaultValue=""
        placeholder="Enter signed raw transaction"
        // eslint-disable-next-line no-console
        onClear={() => console.log('textarea cleared')}
        value={signedRawTxn}
        onValueChange={setSignedRawTxn}
        minRows={8}
      />

      <ConnectButton />

      {isConnected &&
        chain?.id === network.id &&
        status === 'authenticated' && (
          <Button
            color="secondary"
            isLoading={loading}
            fullWidth
            className="mt-4"
            onPress={async () => {
              setLoading(true);

              try {
                const transactionHash = await sendRawTransaction(
                  network.id,
                  signedRawTxn as Hex,
                );
                const transaction = await waitForTransactionReceipt(
                  network.id,
                  transactionHash,
                );
                console.log({ transactionHash, transaction }, 999);
              } catch (e) {
                console.log(111, e);
              }

              setLoading(false);
            }}
          >
            Broadcast Raw Transaction
          </Button>
        )}
    </div>
  );
};
