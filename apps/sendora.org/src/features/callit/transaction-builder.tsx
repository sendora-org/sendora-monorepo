'use client';
import { CallStep } from '@/components/callstep';
import ConnectButton from '@/components/connect-button';

import { ZERO_ADDRESS } from '@/constants/common';
import { numberFormats } from '@/constants/common';
import useAuthStore from '@/hooks/useAuth';
import { useLocale } from '@/hooks/useLocale';
import { actions } from '@/libs/actions';
import { waitForTransactionReceipt } from '@/libs/common';
import { getCalldata } from '@/libs/common';
import { call, getDecodedFunctionResult } from '@/libs/common';
import { useScopedCallBuilder } from '@/providers/callBuilder-provider';
import { CallBuilderProvider } from '@/providers/callBuilder-provider';
import { Button } from '@heroui/react';
import { Json } from 'ox';
import React, { useState } from 'react';
import type { Chain, Hex } from 'viem';

import { ErrorPrompt } from '@/components/error-prompt';
import FloatingToolbarWithPanel from '@/components/floating-toolbar-panel2';
import JsonViewer from '@/components/json-viewer';
import { useAccount } from 'wagmi';
import { useSendTransaction } from 'wagmi';
type IProps = {
  network: Chain;
};

export const WrapTransactionBuilder = ({ network }: IProps) => {
  return (
    <CallBuilderProvider>
      <TransactionBuilder network={network} />
    </CallBuilderProvider>
  );
};

export const TransactionBuilder = ({ network }: IProps) => {
  const { locale } = useLocale();

  const { decimalSeparator, thousandSeparator } = numberFormats[locale];

  const steps = useScopedCallBuilder((s) => s.steps);
  const currentStep = useScopedCallBuilder((s) => s.currentStep);
  const addStep = useScopedCallBuilder((s) => s.addStep);
  const removeStep = useScopedCallBuilder((s) => s.removeStep);
  const updateStep = useScopedCallBuilder((s) => s.updateStep);
  const step = steps.find((s) => s.id === currentStep);
  const { sendTransactionAsync } = useSendTransaction();
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleSubmitAll = async () => {
    console.log('🚀 steps:', steps);

    setResult('');
    try {
      const data = steps[0];
      const calldata = getCalldata(data.contractMethod, data.args ?? []);

      // const account = isAddress("", { strict: false })
      //   ? ""
      //   : ZERO_ADDRESS;
      const account = ZERO_ADDRESS;

      if (data.functionType === 'readable') {
        const result = await call(
          network.id,
          account,
          data.to as Hex,
          calldata,
        );

        let decodedResult = null;
        if (result) {
          decodedResult = getDecodedFunctionResult(
            data.contractMethod,
            result.data as Hex,
          );
        }

        setResult(Json.stringify(decodedResult ?? ''));
        setError('');
      } else {
        const transactionHash = await sendTransactionAsync({
          to: data.to as Hex,
          value: data.value ?? 0n,
          data: calldata,
        });
        const transaction = await waitForTransactionReceipt(
          network.id,
          transactionHash,
        );

        setResult(Json.stringify(transaction ?? ''));
        setError('');
      }
    } catch (e) {
      console.log(e);
      setError(JSON.stringify(e, null, 2));
    }
  };

  const { isConnected, chain, chainId, address } = useAccount();
  const { status, loginAddress } = useAuthStore();

  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col gap-2 w-full  ">
      <FloatingToolbarWithPanel
        actions={(text) => {
          return actions(network.id, text, thousandSeparator, decimalSeparator);
        }}
      >
        <CallStep
          network={network}
          data={step}
          key={step?.id}
          onRemove={() => removeStep(step?.id)}
          onChange={(data) => updateStep(step?.id, data)}
        />
      </FloatingToolbarWithPanel>
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
                await handleSubmitAll();
              } catch (e) {
                console.log(111, e);
              }

              setLoading(false);
            }}
          >
            CALL
          </Button>
        )}

      <FloatingToolbarWithPanel
        actions={(text) => {
          return actions(network.id, text, thousandSeparator, decimalSeparator);
        }}
      >
        {result && <JsonViewer data={JSON.parse(result)} enableCopy />}

        {error && <ErrorPrompt error={error} setError={setError} />}
      </FloatingToolbarWithPanel>
    </div>
  );
};
