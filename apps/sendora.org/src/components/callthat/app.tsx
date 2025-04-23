'use client';

import { Button, Input, NumberInput, Tab, Tabs, Textarea } from '@heroui/react';
import { Switch } from '@heroui/react';
import React, { useMemo, useState } from 'react';
import { type Chain, isAddress } from 'viem';
import type { Hex } from 'viem';
import ConnectButton from '../connect-button';
import H3Title from '../h3-title';

import { isContract } from '@/libs/common';
import { Select, SelectItem, SelectSection } from '@heroui/react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { concat } from 'viem';
import { ContractFunctions } from '../contract-functions';

import type { ethers } from 'ethers';
import { encodeAbiParameters, fromBytes } from 'viem';
import { useCall } from 'wagmi';
import { CallButton } from '../call-button';

import { SetGasPrice } from '../set-gas-price';
type Iprops = {
  network: Chain;
};

type Inputs = {
  from: Hex;
  CA: Hex;
  enableABI: boolean;
  ABI: string;
  fnSelector: string;
  args: any;
  value: bigint;
};

type IFns = {
  nonpayable: ethers.FunctionFragment[];
  payable: ethers.FunctionFragment[];
  readable: ethers.FunctionFragment[];
  unknown: ethers.FunctionFragment[];
  writable: ethers.FunctionFragment[];
};

export const App = ({ network }: Iprops) => {
  console.log(`deploy contract render ${new Date().toISOString()}`);
  const [gasPrice, setGasPrice] = useState<bigint>(10000000n);
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      enableABI: false,
      args: {},
      value: 0n,
    },
  });
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

  const [selected, setSelected] = React.useState('readable');

  console.log(watch('CA'));
  console.log('from', watch('from'));
  console.log('enableABI', watch('enableABI'));
  const enableABI = watch('enableABI');
  const CA = watch('CA');
  const fnSelector = watch('fnSelector');
  const ABI = watch('ABI');

  const args = watch('args');
  const value = watch('value');
  const from = watch('from');

  console.log({ value });

  const [fns, setFns] = useState<IFns>({
    nonpayable: [],
    payable: [],
    readable: [],
    unknown: [],
    writable: [],
  });

  const [events, setEvents] = useState<ethers.EventFragment[]>([]);

  console.log({ fnSelector });

  console.log({ args });

  const selectedFragment = useMemo(() => {
    const functions = [
      ...fns.payable,
      ...fns.nonpayable,
      ...fns.readable,
      ...fns.unknown,
    ];
    return functions.find((f) => f.selector === fnSelector);
  }, [fnSelector, fns]);

  const specificArgs = watch(`args.${fnSelector}`);

  const calldata = useMemo(() => {
    console.log({ selectedFragment, specificArgs });
    if (
      selectedFragment?.inputs &&
      selectedFragment?.inputs.length > 0 &&
      specificArgs?.length === selectedFragment?.inputs.length
    ) {
      try {
        return concat([
          fnSelector as Hex,
          encodeAbiParameters(selectedFragment!.inputs, specificArgs),
        ]);
      } catch (e) {}
    }
    return fnSelector;
  }, [fnSelector, specificArgs]);

  return (
    <form
      className="flex flex-col gap-2 w-full"
      onSubmit={handleSubmit(onSubmit)}
    >
      <H3Title>
        From <span className="text-red-600">*</span>
      </H3Title>

      <div className="text-sm sm:text-base">
        <ConnectButton showAddr={true} />
      </div>

      <H3Title>
        To <span className="text-red-600">*</span>
      </H3Title>

      <Input
        isInvalid={!!errors.CA}
        errorMessage={errors.CA?.message}
        {...register('CA', {
          required: 'CA is required',
          validate: async (value) => {
            const isValid = await isContract(network.id, value);
            return isValid || 'Invalid CA';
          },
        })}
        placeholder="CA(Contract Address)"
      />

      {!!!errors.CA && CA?.length > 0 && (
        <>
          <div className="flex gap-4">
            <H3Title>ABI</H3Title>
            <Switch size="sm" aria-label="ABI" {...register('enableABI')} />

            {/* <Controller
                        control={control}
                        name="enableABI"
                        render={({ field: { onChange, value } }) => (
                            <Switch
                                isSelected={value}
                                onValueChange={onChange}
                            >
                             
                            </Switch>
                        )}
                    /> */}
          </div>

          {enableABI && <Textarea {...register('ABI')} />}

          <Tabs
            aria-label="Tabs radius"
            radius={'sm'}
            selectedKey={selected}
            onSelectionChange={(v) => {
              setSelected(String(v));
            }}
          >
            <Tab key={'readable'} title={`Readable (${fns.readable.length})`} />
            <Tab
              key={'writable'}
              title={`Writable (${fns.writable.length + fns.payable.length})`}
            />
            <Tab key={'events'} title={`Events (${events.length})`} />
            <Tab key={'unknown'} title={`Unknown (${fns.unknown.length})`} />
          </Tabs>
          <ContractFunctions
            CA={CA}
            chainId={network.id}
            control={control}
            fnSelector={fnSelector}
            enableABI={enableABI}
            ABI={ABI}
            fns={fns}
            setFns={setFns}
            setValue={setValue}
            watch={watch}
            events={events}
            setEvents={setEvents}
            selected={selected}
          />
        </>
      )}

      <H3Title>Calldata</H3Title>

      <Textarea isReadOnly value={calldata} />

      {selectedFragment && selectedFragment.stateMutability === 'payable' && (
        <>
          <H3Title>Value</H3Title>

          <Controller
            control={control}
            name={`value`}
            rules={{ required: 'required' }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <NumberInput
                hideStepper
                formatOptions={{
                  useGrouping: true,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 20,
                }}
                isRequired
                classNames={{
                  inputWrapper: 'h-8',
                }}
                value={Number(value) / 10 ** 18}
                onValueChange={(v) => {
                  onChange(BigInt(Math.ceil(v * 10 ** 18)));
                }}
                minValue={0}
                endContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">
                      {network?.nativeCurrency?.symbol}
                    </span>
                  </div>
                }
              />
              // <Input
              //   className="my-2"
              //   isInvalid={!!error}
              //   errorMessage={error?.message}
              //   //  biome-ignore lint/suspicious/noArrayIndexKey: reason

              //   placeholder={`_${input.type}`}
              //   value={value}
              //   onValueChange={(value) => {
              //     updateArgAtIndex(index, value, specificArgs);
              //   }}
              //   startContent={
              //     <div className="pointer-events-none flex items-center">
              //       <span className="text-default-400 text-small">
              //         {input.name}
              //       </span>
              //     </div>
              //   }
              // />
            )}
          />
        </>
      )}

      {selected === 'writable' && (
        <>
          <SetGasPrice chain={network} onValueChange={setGasPrice} />
        </>
      )}

      <Button type="submit">confirm</Button>

      <CallButton
        account={from}
        to={CA}
        data={calldata}
        value={value}
        gasPrice={gasPrice}
      />
    </form>
  );
};
