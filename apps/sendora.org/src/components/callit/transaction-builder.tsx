'use client';
import { CallStep } from '@/components/callstep';
import ConnectButton from '@/components/connect-button';
import H3Title from '@/components/h3-title';
import { ZERO_ADDRESS } from '@/constants/common';
import useAuthStore from '@/hooks/useAuth';
import {
  isDecimal,
  isHexString,
  isIntegerString,
  sendRawTransaction,
  waitForTransactionReceipt,
} from '@/libs/common';
import { getCalldata } from '@/libs/common';
import { call, getDecodedFunctionResult } from '@/libs/common';
import { useScopedCallBuilder } from '@/providers/callBuilder-provider';
import { Button, Textarea } from '@heroui/react';
import * as dayjs from 'dayjs';
import React, { useState } from 'react';
import type { Chain, Hex } from 'viem';
import { isAddress, numberToHex, parseEther, toFunctionSelector } from 'viem';
import {
  formatEther,
  formatUnits,
  hexToNumber,
  hexToString,
  parseUnits,
  stringToHex
} from 'viem';
import { useAccount } from 'wagmi';
import { useSendTransaction } from 'wagmi';
import { ErrorPrompt } from '../error-prompt';
import FloatingToolbarWithPanel from '../floating-toolbar-panel2';
import JsonViewer from '../json-viewer';
type Iprops = {
  network: Chain;
};

export const TransactionBuilder = ({ network }: Iprops) => {
  const steps = useScopedCallBuilder((s) => s.steps);
  const currentStep = useScopedCallBuilder((s) => s.currentStep);
  const addStep = useScopedCallBuilder((s) => s.addStep);
  const removeStep = useScopedCallBuilder((s) => s.removeStep);
  const updateStep = useScopedCallBuilder((s) => s.updateStep);
  const step = steps.find((s) => s.id === currentStep)!;
  const { sendTransactionAsync } = useSendTransaction();
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleSubmitAll = async () => {
    console.log('🚀 steps:', steps);

    setResult('');
    try {
      const data = steps[0];
      const selector = toFunctionSelector(data.contractMethod);
      const calldata = getCalldata(data.contractMethod, data.args ?? []);

      // const account = isAddress("", { strict: false })
      //   ? ""
      //   : ZERO_ADDRESS;
      const account = ZERO_ADDRESS;

      // const transactionHash = await sendRawTransaction(
      //   network.id,
      //   signedRawTxn as Hex,
      // );
      // const transaction = await waitForTransactionReceipt(
      //   network.id,
      //   transactionHash,
      // );
      // console.log({ transactionHash, transaction }, 999);

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
        console.log({ data, decodedResult });
        setResult(decodedResult ?? '');
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
        console.log({ transactionHash, transaction }, 999);

        console.log({ data, transaction });
        setResult(transaction ?? '');
        setError('');
      }
    } catch (e) {
      console.log(e);
      setError(JSON.stringify(e, null, 2));
    }
  };

  const { isConnected, chain, chainId, address } = useAccount();
  const { status, loginAddress } = useAuthStore();
  const [signedRawTxn, setSignedRawTxn] = useState<string>('');

  const [loading, setLoading] = useState(false);

  const sampleData = {
    name: 'Alice',
    age: 25,
    roles: ['admin', 'editor'],
    active: true,
    settings: {
      theme: 'dark',
      language: 'zh-CN',
    },
  };
  return (
    <div className="flex flex-col gap-2 w-full  ">
      <FloatingToolbarWithPanel
        actions={(text) => {
          if (isDecimal(text)) {
            return [
              {
                label: 'μUSDT',
                icon: '📋',
                handler: (txt) => parseUnits(txt, 6),
              },
              {
                label: 'Wei',
                icon: '🌎',
                handler: (txt) => parseEther(txt),
              },
              {
                label: 'External link',
                icon: '🌎',
                handler: (txt) => `ddd${txt.split('').reverse().join('')}`,
              },
            ];
          }

          if (isIntegerString(text)) {
            return [
              {
                label: 'bytes',
                icon: '📋',
                handler: (txt) => numberToHex(BigInt(text)),
              },
              {
                label: 'bytes32',
                icon: '📋',
                handler: (txt) => numberToHex(BigInt(text), { size: 32 }),
              },
              {
                label: 'time',
                icon: '📋',
                handler: (txt) =>
                  dayjs.unix(Number(txt)).format('YYYY-MM-DD HH:mm:ss'),
              },
              {
                label: 'USDT',
                icon: '📋',
                handler: (txt) => formatUnits(BigInt(txt), 6),
              },
              {
                label: 'μUSDT',
                icon: '📋',
                handler: (txt) => parseUnits(txt, 6),
              },
              {
                label: 'ETH',
                icon: '🌎',
                handler: (txt) => formatEther(BigInt(txt)),
              },
              {
                label: 'Wei',
                icon: '🌎',
                handler: (txt) => parseEther(txt),
              },
              {
                label: 'External link',
                icon: '🌎',
                handler: (txt) => `ddd${txt.split('').reverse().join('')}`,
              },
            ];
          }

          if (isHexString(text)) {
            return [
              {
                label: 'number',
                icon: '📋',
                handler: (txt) => hexToNumber(txt as Hex),
              },
              {
                label: 'text',
                icon: '📋',
                handler: (txt) => hexToString(txt as Hex),
              },
              {
                label: 'External link',
                icon: '🌎',
                handler: (txt) => `ddd${txt.split('').reverse().join('')}`,
              },
            ];
          }

          if (text.startsWith('http')) {
            return [
              {
                label: 'External link',
                icon: '🔗',
                handler: (txt) => `open: ${txt}`,
              },
            ];
          }

          return [
            {
              label: 'bytes',
              icon: '📋',
              handler: (txt) => stringToHex(text),
            },
            {
              label: 'bytes32',
              icon: '📋',
              handler: (txt) => stringToHex(text, { size: 32 }),
            },
            {
              label: 'timestamp',
              icon: '📋',
              handler:   (txt) => dayjs(txt).unix()
            },
          ];
        }}
      >
        <CallStep
          network={network}
          data={step}
          key={step.id}
          onRemove={() => removeStep(step.id)}
          onChange={(data) => updateStep(step.id, data)}
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
          if (isDecimal(text)) {
            return [
              {
                label: 'μUSDT',
                icon: '📋',
                handler: (txt) => parseUnits(txt, 6),
              },
              {
                label: 'Wei',
                icon: '🌎',
                handler: (txt) => parseEther(txt),
              },
              {
                label: 'External link',
                icon: '🌎',
                handler: (txt) => `ddd${txt.split('').reverse().join('')}`,
              },
            ];
          }

          if (isIntegerString(text)) {
            return [
              {
                label: 'bytes',
                icon: '📋',
                handler: (txt) => numberToHex(BigInt(text)),
              },
              {
                label: 'bytes32',
                icon: '📋',
                handler: (txt) => numberToHex(BigInt(text), { size: 32 }),
              },
              {
                label: 'time',
                icon: '📋',
                handler: (txt) =>
                  dayjs.unix(Number(txt)).format('YYYY-MM-DD HH:mm:ss'),
              },
              {
                label: 'USDT',
                icon: '📋',
                handler: (txt) => formatUnits(BigInt(txt), 6),
              },
              {
                label: 'μUSDT',
                icon: '📋',
                handler: (txt) => parseUnits(txt, 6),
              },
              {
                label: 'ETH',
                icon: '🌎',
                handler: (txt) => formatEther(BigInt(txt)),
              },
              {
                label: 'Wei',
                icon: '🌎',
                handler: (txt) => parseEther(txt),
              },
              {
                label: 'External link',
                icon: '🌎',
                handler: (txt) => `ddd${txt.split('').reverse().join('')}`,
              },
            ];
          }

          if (isHexString(text)) {
            return [
              {
                label: 'number',
                icon: '📋',
                handler: (txt) => hexToNumber(txt as Hex),
              },
              {
                label: 'text',
                icon: '📋',
                handler: (txt) => hexToString(txt as Hex),
              },
              {
                label: 'External link',
                icon: '🌎',
                handler: (txt) => `ddd${txt.split('').reverse().join('')}`,
              },
            ];
          }

          if (text.startsWith('http')) {
            return [
              {
                label: 'External link',
                icon: '🔗',
                handler: (txt) => `open: ${txt}`,
              },
            ];
          }

          return [
            {
              label: 'bytes',
              icon: '📋',
              handler: (txt) => stringToHex( (text)),
            },
            {
              label: 'bytes32',
              icon: '📋',
              handler: (txt) => stringToHex( (text), { size: 32 }),
            },
            {
              label: 'timestamp',
              icon: '📋',
              handler:   (txt) => dayjs(txt).unix()
            },
          ];
        }}
      >
        {result && <JsonViewer data={result} enableCopy />}

        {error && <ErrorPrompt error={error} setError={setError} />}
      </FloatingToolbarWithPanel>
    </div>
  );
};
