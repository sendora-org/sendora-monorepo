import { isContract, isValidJSON } from '@/libs/common';
import { Card, Input, NumberInput, Textarea } from '@heroui/react';
import { Interface, ParamType, ethers } from 'ethers';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import type { Chain } from 'viem';
import { getDefaultValue } from '../libs/common';
import { FormField } from './callit-form-field';
import H3Title from './h3-title';

import { getContractABIs } from '@/libs/common';

type CallStepProps = {
  network: Chain;
  data: CallStepData;
  onRemove: () => void;
  onChange: (data: CallStepData) => void;
};

export type CallStepData = {
  id: string;
  to: string;
  value: bigint;
  abi: string;
  contractMethod: string; // human-readable abi item
  args?: any[];
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
      to: data.to,
      value: data.value,
      args: data.args || [],
      contractMethod: data.contractMethod,
      abi: data.abi,
    });
  }, []);

  const to = watch('to');
  //   const abi = watch('abi');

  const isValidTo = useMemo(() => {
    console.log(555, errors.to);
    return !!!errors.to && to !== '';
  }, [errors.to]);

  console.log({ isValidTo });

  useEffect(() => {
    const validateAndFetch = async () => {
      if (isValidTo) {
        setShowABI(true);
        const details = await getContractABIs(network.id, to);
        console.log({ details });
        setValue('abi', details);
      } else {
        setShowABI(false);
      }
    };

    if (to) {
      validateAndFetch();
    } else {
      setShowABI(false);
    }
  }, [to, isValidTo, setValue]);

  const [showABI, setShowABI] = useState(false);

  //   const contractMethod = watch('contractMethod');

  //   const iface = useMemo(() => {
  //     try {
  //       const JSONABI = JSON.parse(abi);
  //       return new ethers.Interface(JSONABI);
  //     } catch {
  //       return null;
  //     }
  //   }, [abi]);

  //   const functions: ethers.Fragment[] = useMemo(() => {
  //     if (!iface) return [];

  //     return Object.values(iface?.fragments ?? []);
  //   }, [iface]);

  //   const selectedFunc = useMemo(() => {
  //     if (!iface || !contractMethod) return null;
  //     try {
  //       return iface.getFunction(contractMethod);
  //     } catch {
  //       return null;
  //     }
  //   }, [iface, contractMethod]);

  //   const inputs = selectedFunc?.inputs ?? [];

  //   const isPayable = selectedFunc?.payable ?? false;

  //   const onSelectMethod = (funcName: string) => {
  //     const iface = new ethers.Interface([funcName]);
  //     const fn = iface.getFunction(funcName);
  //     const defaultValues = fn.inputs.map((input) => getDefaultValue(input));
  //     reset({
  //       args: defaultValues,
  //       value: 0n,
  //       contractMethod: funcName,
  //       abi: abi,
  //     });
  //   };

  const submitStep = (submit_data: any) => {
    const valueInWei = 0n; //isPayable ? submit_data.value : 0n;

    onChange({
      id: data.id,
      to: submit_data.to,
      abi: submit_data.abi,
      contractMethod: submit_data.contractMethod,
      args: submit_data.args,
      value: valueInWei,
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
            validate: async (value) => {
              const isValid = await isContract(network.id, value);
              return isValid || 'Invalid CA (Contract Address)';
            },
          })}
          placeholder="CA (Contract Address)"
        />

        {showABI && (
          <>
            <H3Title>ABI</H3Title>

            <Textarea
              isInvalid={!!errors.abi}
              errorMessage={String(errors.abi?.message)}
              {...register('abi', {
                required: 'Required',
                validate: (value) => {
                  const isValid = isValidJSON(value);
                  return isValid || 'Invalid JSON value';
                },
              })}
            />
          </>
        )}

        {/* <label className="block font-medium">ABI (JSON)</label>
                <textarea
                    className="border px-2 py-1 rounded w-full mb-2"
                    {...register('abi')}
                    rows={5}
                /> */}
        {/* 
                {functions.length > 0 && (
                    <>
                        <label className="block font-medium">方法名</label>
                        <select
                            onChange={(e) => onSelectMethod(e.target.value)}
                            className="w-full border px-2 py-1 rounded mb-4"
                        >
                            <option>选择方法</option>
                            {functions.map((fn) => (
                                <option key={fn.format('full')} value={fn.format('full')}>
                                    {fn.format('full')}
                                </option>
                            ))}
                        </select>
                    </>
                )} */}

        {/* {inputs.length > 0 && (
          <FormProvider {...methods}>
            {inputs.map((param, idx) => (
              <FormField key={idx} param={param} name={`args.${idx}`} />
            ))}
          </FormProvider>
        )} */}
      </form>
    </Card>
  );
};
