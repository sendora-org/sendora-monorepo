import H3Title from '@/components/h3-title';
import { getContractFunctions } from '@/libs/common';
import { Input, Spinner } from '@heroui/react';
import { Select, SelectItem, SelectSection } from '@heroui/react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { Hex } from 'viem';

import type { EventFragment, FunctionFragment, ethers } from 'ethers';
type IProps = {
  chainId: number;
  CA: Hex;
  control: any;
  fnSelector: string;
  enableABI: boolean;
  ABI: string;
  fns: IFns;
  setFns: any;
  setValue: any;
  watch: any;
  events: any;
  setEvents: any;
  selected: any;
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
  fnSelector,
  enableABI,
  ABI,
  fns,
  setFns,
  setValue,
  watch,
  events,
  setEvents,
  selected,
}: IProps) => {
  const [loading, setLoading] = useState(true);

  const specificArgs = watch(`args.${fnSelector}`);

  const updateArgAtIndex = (
    index: number,
    newValue: any,
    specificArgs: any,
  ) => {
    const newArgs = [...(specificArgs ?? [])];
    newArgs[index] = newValue;
    setValue(`args.${fnSelector}`, newArgs);
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
    return functions.find((f) => f.selector === fnSelector);
  }, [fnSelector, fns]);

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
                name="fnSelector"
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
                          <SelectItem key={f.selector}>
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
                        key={`args.${fnSelector}.${index}`}
                        control={control}
                        name={`args.${fnSelector}.${index}`}
                        rules={{ required: 'required' }}
                        render={({
                          field: { onChange, value },
                          fieldState: { error },
                        }) => (
                          <Input
                            className="my-2"
                            isInvalid={!!error}
                            errorMessage={error?.message}
                            //  biome-ignore lint/suspicious/noArrayIndexKey: reason

                            placeholder={`_${input.type}`}
                            value={value}
                            onValueChange={(value) => {
                              updateArgAtIndex(index, value, specificArgs);
                            }}
                            startContent={
                              <div className="pointer-events-none flex items-center">
                                <span className="text-default-400 text-small">
                                  {input.name}
                                </span>
                              </div>
                            }
                          />
                        )}
                      />
                    ),
                  )
              }
            </>
          )}

          {selected === 'events' && (
            <>
              <Controller
                control={control}
                name="fnSelector"
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
                          <SelectItem key={f.topicHash}>
                            {f.format('full').slice('event'.length)}
                          </SelectItem>
                        );
                      }}
                    </SelectSection>
                  </Select>
                )}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};
