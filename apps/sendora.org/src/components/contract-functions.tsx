import H3Title from '@/components/h3-title';
import { getContractFunctions } from '@/libs/common';
import { Input, Spinner } from '@heroui/react';
import { Select, SelectItem, SelectSection } from '@heroui/react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { Hex } from 'viem';

import type { EventFragment, FunctionFragment, ethers } from 'ethers';
import { AddressInput } from './args-input/address-input';
import { ArrayInput } from './args-input/array-input';
import { BoolInput } from './args-input/bool-input';
import { ByteInput } from './args-input/byte-input';
import { IntInput } from './args-input/int-input';
import { StringInput } from './args-input/string-input';
import { TupleInput } from './args-input/tuple-input';

type IProps = {
  chainId: number;
  CA: Hex;
  control: any;
  selector: string;
  enableABI: boolean;
  ABI: string;
  fns: IFns;
  setFns: any;
  setValue: any;
  watch: any;
  events: any;
  setEvents: any;
  selected: any;
  selector: Hex;
};

type IFns = {
  nonpayable: ethers.FunctionFragment[];
  payable: ethers.FunctionFragment[];
  readable: ethers.FunctionFragment[];
  unknown: ethers.FunctionFragment[];
};

export const ContractFunctions = ({
  chainId,
  CA,
  control,

  enableABI,
  ABI,
  fns,
  setFns,
  setValue,
  watch,
  events,
  setEvents,
  selected,
  selector,
}: IProps) => {
  const [loading, setLoading] = useState(true);

  const specificArgs = watch(`args.${selector}`);

  const updateArgAtIndex = (
    index: number,
    newValue: any,
    specificArgs: any,
  ) => {
    const newArgs = [...(specificArgs ?? [])];
    newArgs[index] = newValue;
    setValue(`args.${selector}`, newArgs);
  };

  console.log({ chainId, CA });
  useEffect(() => {
    console.log(CA);
    setLoading(true);
    getContractFunctions(chainId, CA, enableABI, ABI).then((result) => {
      setFns(result.splitFns);
      setEvents(result.events);
      setLoading(false);
    });
  }, [CA, chainId, enableABI, ABI]);

  const selectedFragment = useMemo(() => {
    const functions = [
      ...fns.payable,
      ...fns.nonpayable,
      ...fns.readable,
      ...fns.unknown,
    ];
    return functions.find((f) => f.selector === selector);
  }, [selector, fns]);

  console.log({ selectedFragment });
  return (
    <div>
      {loading && (
        <div className="flex gap-2 items-center">
          <Spinner
            size="sm"
            classNames={{ label: 'text-foreground mt-4' }}
            variant="simple"
          />
          Loading the interface ...
        </div>
      )}

      {!loading && (
        <>
          <H3Title>
            Function <span className="text-red-600">*</span>
          </H3Title>

          {selected !== 'events' && (
            <>
              <Controller
                control={control}
                name="selectedAbi"
                render={({ field }) => (
                  // <Select {...field}>

                  // </Select>

                  <Select
                    {...field}
                    disallowEmptySelection
                    className=""
                    placeholder="Select a function"
                  >
                    <SelectSection
                      title={`${selected} (${fns?.[selected]?.length})`}
                      items={fns?.[selected] as FunctionFragment[]}
                    >
                      {(f) => {
                        return (
                          <SelectItem key={f.format('full')}>
                            {f.format('full').slice('function '.length)}
                          </SelectItem>
                        );
                      }}
                    </SelectSection>

                    {/* <SelectSection
                  showDivider
                  title={`Unknown (${fns.unknown.length})`}
                  items={fns.unknown}
                >
                  {(f) => {
                    return (
                      <SelectItem key={f.selector}>
                        {f.format('full').slice('function '.length)}
                      </SelectItem>
                    );
                  }}
                </SelectSection>

                <SelectSection
                  showDivider
                  title={`Payable (${fns.payable.length})`}
                  items={fns.payable}
                >
                  {(f) => {
                    return (
                      <SelectItem key={f.selector}>
                        {f.format('full').slice('function '.length)}
                      </SelectItem>
                    );
                  }}
                </SelectSection>

                <SelectSection
                  title={`Writable (${fns.nonpayable.length})`}
                  items={fns.nonpayable}
                >
                  {(f) => {
                    return (
                      <SelectItem key={f.selector}>
                        {f.format('full').slice('function '.length)}
                      </SelectItem>
                    );
                  }}
                </SelectSection> */}
                  </Select>
                )}
              />

              {
                // biome-ignore  lint/suspicious/noExplicitAny: reason
                selectedFragment &&
                  selectedFragment.inputs.map(
                    (input: ethers.ParamType, index) => (
                      <Controller
                        key={`args.${selector}.${index}`}
                        control={control}
                        name={`args.${selector}.${index}`}
                        rules={{ required: 'required' }}
                        render={({
                          field: { onChange, value },
                          fieldState: { error },
                        }) => {
                          if (input.baseType === 'bool') {
                            return (
                              <BoolInput
                                error={error}
                                inputType={input.type}
                                inputName={input.name}
                                value={value}
                                onChange={(value) => {
                                  updateArgAtIndex(index, value, specificArgs);
                                }}
                              />
                            );
                          }

                          if (input.baseType === 'string') {
                            return (
                              <StringInput
                                error={error}
                                inputType={input.type}
                                inputName={input.name}
                                value={value}
                                onChange={(value) => {
                                  updateArgAtIndex(index, value, specificArgs);
                                }}
                              />
                            );
                          }

                          if (input.baseType.startsWith('bytes')) {
                            return (
                              <ByteInput
                                error={error}
                                inputType={input.type}
                                inputName={input.name}
                                value={value}
                                onChange={(value) => {
                                  updateArgAtIndex(index, value, specificArgs);
                                }}
                              />
                            );
                          }

                          if (input.baseType.startsWith('address')) {
                            return (
                              <AddressInput
                                error={error}
                                inputType={input.type}
                                inputName={input.name}
                                value={value}
                                onChange={(value) => {
                                  updateArgAtIndex(index, value, specificArgs);
                                }}
                              />
                            );
                          }

                          if (
                            input.baseType.startsWith('uint') ||
                            input.baseType.startsWith('int')
                          ) {
                            return (
                              <IntInput
                                error={error}
                                inputType={input.type}
                                inputName={input.name}
                                value={value}
                                onChange={(value) => {
                                  updateArgAtIndex(index, value, specificArgs);
                                }}
                              />
                            );
                          }

                          if (input.baseType === 'array') {
                            return (
                              <ArrayInput
                                arrayLength={input.arrayLength}
                                arrayChildren={input.arrayChildren}
                                error={error}
                                inputType={input.type}
                                inputName={input.name}
                                value={value}
                                onChange={(value) => {
                                  updateArgAtIndex(index, value, specificArgs);
                                }}
                              />
                            );
                          }

                          if (input.baseType === 'tuple') {
                            return (
                              <TupleInput
                                components={input.components}
                                error={error}
                                inputType={input.type}
                                inputName={input.name}
                                value={value}
                                onChange={(value) => {
                                  updateArgAtIndex(index, value, specificArgs);
                                }}
                              />
                            );
                          }

                          return (
                            <Input
                              className="my-2"
                              isInvalid={!!error}
                              errorMessage={error?.message}
                              // label={input.name}
                              // labelPlacement='outside'
                              //  biome-ignore lint/suspicious/noArrayIndexKey: reason

                              placeholder={`${input.type}`}
                              value={value}
                              onValueChange={(value) => {
                                updateArgAtIndex(index, value, specificArgs);
                              }}
                              // endContent={
                              //   <div className="pointer-events-none flex items-center">
                              //     <span className="text-default-400 text-small">
                              //       {input.type}
                              //     </span>
                              //   </div>
                              // }
                              startContent={
                                <div className="pointer-events-none flex items-center">
                                  <span className="text-default-400 text-small">
                                    {input.name}
                                  </span>
                                </div>
                              }
                            />
                          );
                        }}
                      />
                    ),
                  )
              }
            </>
          )}

          {/* {selected === 'events' && (
            <>
              <Controller
                control={control}
                name="selector"
                render={({ field }) => (
                  <Select
                    {...field}
                    disallowEmptySelection
                    className=""
                    placeholder="Select an event"
                  >
                    <SelectSection
                      title={`${selected} (${events?.length})`}
                      items={events as EventFragment[]}
                    >
                      {(f) => {
                        return (
                          <SelectItem key={f.format('full')}>
                            {f.format('full').slice('event'.length)}
                          </SelectItem>
                        );
                      }}
                    </SelectSection>
                  </Select>
                )}
              />
            </>
          )} */}
        </>
      )}
    </div>
  );
};
