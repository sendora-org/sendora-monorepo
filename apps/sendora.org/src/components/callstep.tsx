import { delay, isContract, isValidJSON, prettifyJSON } from '@/libs/common';
import { getCalldata, getParams } from '@/libs/common';
import {
  Button,
  Card,
  Input,
  NumberInput,
  Select,
  SelectItem,
  SelectSection,
  Tab,
  Tabs,
  Textarea,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { Interface, ParamType, ethers } from 'ethers';
import { nanoid } from 'nanoid';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import type { Chain } from 'viem';
import type { Hex } from 'viem';
import { getDefaultValue } from '../libs/common';
import { FormField } from './callit-form-field';
import { CopyText } from './copy-text-2';
import H3Title from './h3-title';

import { getContractABIs } from '@/libs/common';

type CallStepProps = {
  network: Chain;
  data?: CallStepData;
  onRemove: () => void;
  onChange: (data: CallStepData) => void;
};

export type CallStepData = {
  id: string;
  to: string;
  value: bigint;
  abi: string;
  contractMethod: string; // human-readable abi item
  // biome-ignore  lint/suspicious/noExplicitAny: reason
  args?: any[];
  functionType: string;
};

export const CallStep: React.FC<CallStepProps> = ({
  network,
  data,
  onRemove,
  onChange,
}) => {
  const methods = useForm({ mode: 'onChange', shouldUnregister: false });
  //

  const {
    register,
    watch,
    trigger,
    setValue,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid },
  } = methods;

  useEffect(() => {
    reset({
      to: data?.to || '',
      value: data?.value || 0n,
      args: data?.args || [],
      contractMethod: data?.contractMethod || '',
      abi: data?.abi || '',
      functionType: data?.functionType || 'readable',
    });
  }, [
    data?.to,
    data?.value,
    data?.args,
    data?.contractMethod,
    data?.abi,
    data?.functionType,
    reset,
  ]);

  const to = watch('to');
  const abi = watch('abi');
  // const args = watch('args');
  const args = useWatch({
    control,
    name: 'args',
  });

  console.log({ args });

  const functionType = watch('functionType', 'readable');
  const contractMethod = watch('contractMethod');

  //   const setAbi = async (chainId: number, to: Hex) => {
  //     const details = await getContractABIs(chainId, to);
  //     console.log({ details });
  //     await delay(150);
  // return details
  //   };

  useEffect(() => {
    // setAbi(network.id, to);

    getContractABIs(network.id, to).then((details) => {
      setValue('abi', details);
    });
  }, [to, network.id, setValue]);

  const functions: ethers.FunctionFragment[] = useMemo(() => {
    try {
      const tmp: ethers.FunctionFragment[] = [];
      const JSONABI = JSON.parse(abi);
      ethers.Interface.from(JSONABI).forEachFunction((f) => tmp.push(f));
      return tmp;
    } catch {
      return [];
    }
  }, [abi]);

  const readables: ethers.FunctionFragment[] = useMemo(() => {
    return functions.filter(
      (fn) => fn.stateMutability === 'view' || fn.stateMutability === 'pure',
    );
  }, [functions]);

  const writables: ethers.FunctionFragment[] = useMemo(() => {
    return functions.filter(
      (fn) =>
        fn.stateMutability === 'payable' || fn.stateMutability === 'nonpayable',
    );
  }, [functions]);

  const inputs = useMemo(() => {
    try {
      const iface = new ethers.Interface([contractMethod]);
      const func = iface.getFunction(contractMethod);
      return func?.inputs ?? [];
    } catch (e) {}
    return [];
  }, [contractMethod]);
  const isPayable = useMemo(() => {
    try {
      const iface = new ethers.Interface([contractMethod]);
      const func = iface.getFunction(contractMethod);
      if (functionType === 'writable' && func?.payable) {
        return true;
      }

      return false;
    } catch (e) {}
    return false;
  }, [functionType, contractMethod]);

  useEffect(() => {
    if (contractMethod) {
      setValue('args', []);
    }
  }, [contractMethod, setValue]);

  const params = useMemo(() => {
    return getParams(contractMethod, args);
  }, [contractMethod, args]);

  const calldata = useMemo(() => {
    if (contractMethod === '') {
      return '0x';
    }
    return getCalldata(contractMethod, args);
  }, [contractMethod, args]);

  // biome-ignore  lint/suspicious/noExplicitAny: reason
  const submitStep = (submit_data: any) => {
    const valueInWei = 0n; //isPayable ? submit_data.value : 0n;

    onChange({
      id: data?.id ?? nanoid(),
      to: submit_data.to,
      abi: submit_data.abi,
      contractMethod: submit_data.contractMethod,
      args: submit_data.args,
      value: valueInWei,
      functionType: submit_data.functionType,
    });
  };

  return (
    <Card
      as="dl"
      className="border border-transparent dark:border-default-100 p-4"
    >
      {/*  */}
      <form onBlur={handleSubmit(submitStep)}>
        <H3Title>
          To <span className="text-red-600">*</span>
        </H3Title>
        <Input
          isInvalid={!!errors.to}
          errorMessage={String(errors.to?.message)}
          {...register('to', {
            required: 'Required',
            // validate: async (value) => {
            //   const isValid = await isContract(network.id, value);

            //   return isValid || 'Invalid CA (Contract Address)';
            // },
          })}
          placeholder="CA (Contract Address)"
        />

        <>
          <H3Title>
            ABI <span className="text-red-600">*</span>
          </H3Title>

          <Controller
            name="abi"
            control={control}
            defaultValue=""
            rules={{
              required: 'Required',
              validate: (value) => {
                const isValid = isValidJSON(value);
                return isValid || 'Invalid JSON value';
              },
            }}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return (
                <Textarea
                  endContent={
                    <button
                      type="button"
                      onClick={() => {
                        setValue('abi', prettifyJSON(abi));
                      }}
                    >
                      <Icon icon="mdi:code" width="24" height="24" />
                    </button>
                  }
                  disableAnimation
                  disableAutosize
                  classNames={{
                    input: 'resize-y min-h-[300px]',
                  }}
                  isInvalid={!!error}
                  errorMessage={String(error?.message)}
                  value={value}
                  onValueChange={(v) => {
                    onChange(v);
                  }}
                />
              );
            }}
          />
        </>

        {functions.length > 0 && (
          <>
            <Controller
              control={control}
              name="functionType"
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => {
                return (
                  <Tabs
                    className="my-2"
                    aria-label="Tabs radius"
                    radius={'sm'}
                    selectedKey={value}
                    onSelectionChange={(v) => {
                      onChange(String(v));
                    }}
                  >
                    <Tab
                      key={'readable'}
                      title={`Readable (${readables.length})`}
                    />
                    <Tab
                      key={'writable'}
                      title={`Writable (${writables.length})`}
                    />
                  </Tabs>
                );
              }}
            />

            <div className="flex items-center mb-2 justify-between">
              <H3Title>
                Function <span className="text-red-600">*</span>
              </H3Title>

              <div className="flex items-center">
                <CopyText showText="Calldata">{calldata}</CopyText>
                <CopyText showText="Parameters">{params}</CopyText>
              </div>
            </div>

            {functionType === 'readable' && (
              <Controller
                control={control}
                name="contractMethod"
                render={({ field }) => (
                  <Select
                    {...field}
                    disallowEmptySelection
                    className=""
                    placeholder="Select a function"
                  >
                    <SelectSection
                      title={`Readable (${readables?.length})`}
                      items={readables as ethers.FunctionFragment[]}
                    >
                      {(f) => {
                        return (
                          <SelectItem key={f.format('full')}>
                            {f.format('full').slice('function '.length)}
                          </SelectItem>
                        );
                      }}
                    </SelectSection>
                  </Select>
                )}
              />
            )}

            {functionType === 'writable' && (
              <Controller
                control={control}
                name="contractMethod"
                render={({ field }) => (
                  <Select
                    {...field}
                    disallowEmptySelection
                    className=""
                    placeholder="Select a function"
                  >
                    <SelectSection
                      title={`Writable (${writables?.length})`}
                      items={writables as ethers.FunctionFragment[]}
                    >
                      {(f) => {
                        return (
                          <SelectItem key={f.format('full')}>
                            {f.format('full').slice('function '.length)}
                          </SelectItem>
                        );
                      }}
                    </SelectSection>
                  </Select>
                )}
              />
            )}

            {inputs.length > 0 && (
              <FormProvider {...methods}>
                {inputs.map((param, idx) => (
                  <FormField
                    // biome-ignore lint/suspicious/noArrayIndexKey: reason
                    key={`${contractMethod}-args-${idx}`}
                    param={param}
                    name={`args.${idx}`}
                  />
                ))}
              </FormProvider>
            )}

            {isPayable && (
              <>
                <H3Title>Value</H3Title>

                <Controller
                  control={control}
                  name="value"
                  rules={{ required: 'required' }}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
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
                  )}
                />
              </>
            )}
          </>
        )}
      </form>
    </Card>
  );
};
