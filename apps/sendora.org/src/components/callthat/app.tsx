'use client';

import { Button, Input, NumberInput, Tab, Tabs, Textarea } from '@heroui/react';
import { Switch } from '@heroui/react';
import React, { useMemo, useState } from 'react';
import { type Address, type Chain, isAddress, toEventSelector } from 'viem';
import type { Hex } from 'viem';
import ConnectButton from '../connect-button';
import H3Title from '../h3-title';

import { isContract } from '@/libs/common';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { ContractFunctions } from '../contract-functions';

import { ZERO_ADDRESS } from '@/constants/common';
import { call } from '@/libs/common';
import { getCalldata, getDecodedFunctionResult } from '@/libs/common';
import type { ethers } from 'ethers';
import { toFunctionSelector } from 'viem';
import { SetGasPrice } from '../set-gas-price';
type Iprops = {
  network: Chain;
};

type Inputs = {
  from: Hex;
  to: Address;
  enableABI: boolean;
  ABI: string;
  selectedAbi: string;
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
      from: '0x',
      to: '0x',

      // data
      selectedAbi: '',
      args: {},

      value: 0n,

      // Others
      enableABI: false,
      ABI: '',
    },
  });
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log({ data });

    const selector = toFunctionSelector(data.selectedAbi);
    const calldata = getCalldata(data.selectedAbi, data.args[selector]);

    const account = isAddress(data.from, { strict: false })
      ? data.from
      : ZERO_ADDRESS;

    const result = await call(network.id, account, data.to, calldata);

    let decodedResult = null;
    if (result) {
      decodedResult = getDecodedFunctionResult(
        data.selectedAbi,
        result.data as Hex,
      );
    }

    console.log({ data, decodedResult });
  };

  const [selected, setSelected] = React.useState('readable');

  console.log(watch('to'));
  console.log('from', watch('from'));
  console.log('enableABI', watch('enableABI'));
  const enableABI = watch('enableABI');
  const to = watch('to');

  const ABI = watch('ABI');
  const selectedAbi = watch('selectedAbi');

  const args = watch('args');
  const value = watch('value');
  const from = watch('from');

  const [fns, setFns] = useState<IFns>({
    nonpayable: [],
    payable: [],
    readable: [],
    unknown: [],
    writable: [],
  });

  const [events, setEvents] = useState<ethers.EventFragment[]>([]);

  console.log({ args });

  const fnSelector = useMemo(() => {
    if (selectedAbi != '') {
      return toFunctionSelector(selectedAbi);
    } else {
      return '';
    }
  }, [selectedAbi]);

  const selector = useMemo(() => {
    if (selectedAbi != '') {
      if (selected === 'events') {
        return toEventSelector(selectedAbi);
      } else {
        return toFunctionSelector(selectedAbi);
      }
    } else {
      return '';
    }
  }, [selectedAbi, selected]);

  console.log({ fnSelector, selectedAbi });
  const selectedFragment = useMemo(() => {
    const functions = [
      ...fns.payable,
      ...fns.nonpayable,
      ...fns.readable,
      ...fns.unknown,
    ];
    return functions.find((f) => f.selector === fnSelector);
  }, [fnSelector, fns]);

  const specificArgs = watch(`args.${selector}`);

  const calldata = useMemo(() => {
    if (selectedAbi == '') {
      return '0x';
    }
    try {
      if (args[selector]) {
        return getCalldata(selectedAbi, specificArgs);
      }
    } catch (e) {}

    return selector;
  }, [selectedAbi, specificArgs]);

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
        isInvalid={!!errors.to}
        errorMessage={errors.to?.message}
        {...register('to', {
          required: 'To is required',
          validate: async (value) => {
            const isValid = await isContract(network.id, value);
            return isValid || 'Invalid To';
          },
        })}
        placeholder="CA(Contract Address)"
      />

      {!!!errors.to && to?.length > 0 && (
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
            CA={to}
            chainId={network.id}
            control={control}
            enableABI={enableABI}
            ABI={ABI}
            fns={fns}
            setFns={setFns}
            setValue={setValue}
            watch={watch}
            events={events}
            setEvents={setEvents}
            selected={selected}
            selector={selector}
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
    </form>
  );
};
