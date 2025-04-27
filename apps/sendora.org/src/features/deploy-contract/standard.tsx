'use client';

import ConnectButton from '@/components/connect-button';
import { CopyText } from '@/components/copy-text-2';
import H3Title from '@/components/h3-title';
import { SetGasPrice } from '@/components/set-gas-price';
import useAuthStore from '@/hooks/useAuth';
import { getAbiConstructor } from '@/libs/common';
import { waitForTransactionReceipt } from '@/libs/common';
import { Button, Input, NumberInput, Textarea } from '@heroui/react';
import React, { useMemo, useEffect, useState } from 'react';
import type { Chain, Hex } from 'viem';
import { concatHex, encodeAbiParameters } from 'viem';
import { useAccount, useSendTransaction } from 'wagmi';

type Iprops = {
  network: Chain;
};

export const Standard = ({ network }: Iprops) => {
  const { isConnected, chain, chainId, address } = useAccount();
  const { status, loginAddress } = useAuthStore();

  const [bytecode, setBytecode] = useState<string>('');
  const [salt, setSalt] = useState<string>('');
  const [abi, setABI] = useState<string>('');
  const [value, setValue] = useState<bigint>(0n);
  const [gasPrice, setGasPrice] = useState<bigint>(10000000n);
  const [loading, setLoading] = useState(false);

  const [inputs, setInputs] = useState<string[]>([]);

  const { sendTransactionAsync } = useSendTransaction();

  const abiConstructor = useMemo(() => {
    return getAbiConstructor(abi);
  }, [abi]);

  useEffect(() => {
    if (abiConstructor && abiConstructor.inputs.length >= 1) {
      setInputs(Array(abiConstructor.inputs.length).fill(''));
    }
  }, [abiConstructor]);

  const handleChange = (index: number, nextValue: string) => {
    setInputs((prev) => {
      const next = [...prev];
      next[index] = nextValue;
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <H3Title>
        Bytecode <span className="text-red-600">*</span>
      </H3Title>
      <Textarea
        isClearable
        defaultValue=""
        placeholder="Enter Bytecode"
        // eslint-disable-next-line no-console
        onClear={() => console.log('textarea cleared')}
        value={bytecode}
        onValueChange={setBytecode}
      />

      <H3Title>
        ABI <span className="text-red-600">*</span>
      </H3Title>

      <Textarea
        isClearable
        defaultValue=""
        placeholder="Enter ABI"
        // eslint-disable-next-line no-console
        onClear={() => console.log('textarea cleared')}
        value={abi}
        onValueChange={setABI}
      />

      {abiConstructor != null && abiConstructor.inputs.length > 0 && (
        <>
          <H3Title>Params</H3Title>

          {
            // biome-ignore  lint/suspicious/noExplicitAny: reason
            abiConstructor.inputs.map((input: any, index) => (
              <Input
                //  biome-ignore lint/suspicious/noArrayIndexKey: reason
                key={index}
                placeholder={`_${input.type}`}
                value={inputs[index] ?? ''}
                onValueChange={(v) => {
                  handleChange(index, v);
                }}
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">
                      {input.name}
                    </span>
                  </div>
                }
              />
            ))
          }
          <div className="flex items-center">
            <CopyText showText="Calldata">Calldata</CopyText>
            <CopyText showText="Parameters">Parameters</CopyText>
          </div>
        </>
      )}

      {abiConstructor != null &&
        abiConstructor.stateMutability === 'payable' && (
          <>
            <H3Title>Value</H3Title>
            <NumberInput
              hideStepper
              formatOptions={{
                useGrouping: true,
                minimumFractionDigits: 0,
                maximumFractionDigits: 20,
              }}
              isRequired
              classNames={{
                input: 'text-base ',
              }}
              minValue={0}
              value={Number(value) / 10 ** 18}
              onValueChange={(v) => {
                setValue(BigInt(Math.ceil(v * 10 ** 18)));
              }}
              endContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">
                    {network?.nativeCurrency?.symbol}
                  </span>
                </div>
              }
            />
          </>
        )}

      <SetGasPrice chain={network} onValueChange={setGasPrice} />

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
              const encodedData = encodeAbiParameters(
                abiConstructor?.inputs ?? [],
                inputs,
              );
              const to = null;

              const deployCalldata = concatHex([bytecode as Hex, encodedData]);

              try {
                const transactionHash = await sendTransactionAsync({
                  to,
                  value: value,
                  data: deployCalldata,
                  gasPrice,
                });
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
            Deploy
          </Button>
        )}
    </div>
  );
};
