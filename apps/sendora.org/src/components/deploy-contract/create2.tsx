'use client';

import React, { useMemo, useRef } from 'react';
import type { Chain, Hex } from 'viem';

import { concatHex, getContractAddress, keccak256, toHex } from 'viem';

import { useState } from 'react';
import { useSendTransaction } from 'wagmi';

import { encodeAbiParameters } from 'viem';

import { Input, Textarea } from '@heroui/react';
import { NumberInput } from '@heroui/react';
import { whatsabi } from '@shazow/whatsabi';
import { useEffect } from 'react';

import { Button } from '@heroui/react';

import useAuthStore from '@/hooks/useAuth';
import { CopyText } from '../copy-text-2';

import ConnectButton from '@/components/connect-button';
import { DeterministicDeployerPrompt } from '../deterministic-deployer-prompt';
import H3Title from '../h3-title';
import { SetGasPrice } from '../set-gas-price';

import { getAbiConstructor } from '@/libs/common';
import { waitForTransactionReceipt } from '@/libs/common';
import { useAccount } from 'wagmi';

type Iprops = {
  network: Chain;
};

export const Create2 = ({ network }: Iprops) => {
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
      <DeterministicDeployerPrompt />

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

      <H3Title>Salt</H3Title>
      <Input
        isClearable
        placeholder="Enter salt"
        value={salt}
        onValueChange={setSalt}
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
              const to = '0x4e59b44847b379578588920ca78fbf26c0b4956c';
              const addr = getContractAddress({
                bytecodeHash: keccak256(
                  concatHex([bytecode as Hex, encodedData]),
                ),
                from: to,
                opcode: 'CREATE2',
                salt: keccak256(toHex(salt)),
              });

              const abi = whatsabi.abiFromBytecode(bytecode);

              const deployCalldata = concatHex([
                keccak256(toHex(salt)),
                bytecode as Hex,
                encodedData,
              ]);

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
