import type { ViewUpdate } from '@codemirror/view';
import { Radio, RadioGroup } from '@heroui/react';
import { Button, ButtonGroup, Input, NumberInput, Switch } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useFullscreen } from '@mantine/hooks';
// @ts-ignore
import debounce from 'lodash/debounce';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Chain } from 'viem';

import AddAmount from '@/components/add-amount';
import { CheckReceipt } from '@/components/check-receipt';
import { CheckShowTable } from '@/components/check-show-table';
import type { SNDRACodemirrorRef } from '@/components/codemirror-sndra';
import SNDRACodemirror from '@/components/codemirror-sndra';
import ConnectButton from '@/components/connect-button';
import DecimalSeparatorSwitch from '@/components/decimal-separator-switch';
import H3Title from '@/components/h3-title';
import MyTimer from '@/components/my-timer';
import ShowSample from '@/components/show-sample';
import UploadSpreadsheet from '@/components/upload-spreadsheet';
import { native_coin_input_example } from '@/constants/common';
import { signatureStrategies } from '@/constants/common';
import { ZERO_ADDRESS } from '@/constants/common';
import { EditorRefContext } from '@/constants/contexts';
import useAuthStore from '@/hooks/useAuth';
import { useLocale } from '@/hooks/useLocale';
import { WorkerService } from '@/libs/worker-service';
import { useScopedStep } from '@/providers/step-provider';
import { generateMultisendTask } from '@/services/multisend-task';
import { firstValueFrom } from 'rxjs';

type IProps<T> = {
  network: Chain;
};

type IStepData = {
  isToggle: boolean;
  rate: bigint;
  editorData: string;
  currency: string;
  counting: boolean;
  validating: boolean;
  signatureStrategy: string;
};

export const Prepare = ({ network }: IProps<IStepData>) => {
  // use hooks
  const editorRef = useRef<SNDRACodemirrorRef | null>(null);

  const [isLoading, setLoading] = useState(false);
  const { locale } = useLocale();
  const { toggle, fullscreen } = useFullscreen();
  const [docChangeEvents, setDocChangeEvent] = useState([]);

  const { loginAddress, logout } = useAuthStore();
  const currentStep = useScopedStep((s) => s.currentStep);
  const steps = useScopedStep((s) => s.steps);
  const nextStep = useScopedStep((s) => s.nextStep);
  const prevStep = useScopedStep((s) => s.prevStep);
  const setStepData = useScopedStep((s) => s.setStepData);
  const resetSteps = useScopedStep((s) => s.resetSteps);

  // compute state
  const totalSteps = useMemo(() => {
    return steps.length;
  }, [steps]);

  const data = useMemo(() => {
    return steps[currentStep].data as IStepData;
  }, [steps, currentStep]);
  console.log({ data });

  const latestDocChangeEventId = useMemo(() => {
    return docChangeEvents[0];
  }, [docChangeEvents]);

  // use effects
  useEffect(() => {
    // @ts-ignore
    window?.stonks?.event('/native-coins prepare');
  }, []);

  // callbacks
  const onDocChange = useCallback((update: ViewUpdate) => {
    console.log('onDocChange', update);
    debounce_setStepData();
  }, []);

  const debounce_setStepData = debounce(() => {
    setDocChangeEvent((prev) => {
      return [nanoid(), ...prev];
    });
    setStepData(currentStep, {
      editorData: editorRef.current?.getValue() ?? '',
    });
  }, 1000);

  console.log({ docChangeEvents });

  const workerService = useRef<WorkerService | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL('@/workers/userinput-validate.ts', import.meta.url),
      { type: 'module' },
    );
    workerService.current = new WorkerService(worker);

    return () => {
      if (workerService.current) {
        workerService.current.terminate();
      }
      workerService.current = null;
    };
  }, []);

  return (
    <>
      <EditorRefContext.Provider value={editorRef}>
        <div className="w-full relative mb-12">
          <div className="flex w-full items-center justify-between mb-2">
            <H3Title>List of recipients</H3Title>

            {/* Staus Area */}
            <ButtonGroup className="gap-1">
              <ShowSample
                example={native_coin_input_example[locale].content ?? ''}
              />
              <DecimalSeparatorSwitch />
              <Button isIconOnly size="sm" onPress={toggle}>
                <Icon
                  icon={
                    fullscreen
                      ? 'qlementine-icons:fullscreen-exit-16'
                      : 'qlementine-icons:fullscreen-16'
                  }
                  width="16"
                  height="16"
                />
              </Button>
            </ButtonGroup>
          </div>

          <SNDRACodemirror
            ref={editorRef}
            defaultValue={data.editorData}
            onDocChange={onDocChange}
          />

          {/* Operating Area */}
          <div className="absolute -bottom-10 right-0">
            <ButtonGroup className="gap-1">
              <AddAmount />
              <UploadSpreadsheet />
            </ButtonGroup>
          </div>
        </div>

        <div className="flex w-full items-center justify-between mb-2">
          <H3Title>
            Entered a non-ETH amount? Turn on this option to convert it using
            the exchange rate.
          </H3Title>

          <Switch
            isSelected={data.isToggle}
            onValueChange={(v) => {
              if (v === false) {
                setStepData(currentStep, {
                  isToggle: v,
                  rate: BigInt(10 ** 18),
                });
              } else {
                setStepData(currentStep, {
                  isToggle: v,
                });
              }
            }}
            aria-label="exchange rate"
          />
        </div>

        {data.isToggle && (
          <NumberInput
            hideStepper
            formatOptions={{
              useGrouping: true,
              minimumFractionDigits: 0,
              maximumFractionDigits: 20,
            }}
            isRequired
            classNames={{
              base: '!w-full  mb-4',
              mainWrapper: 'w-full',
              input: 'text-base ',
            }}
            minValue={0}
            value={Number(data.rate) / 10 ** 18}
            onValueChange={(v) => {
              console.log('data v', v);
              setStepData(currentStep, {
                rate: BigInt(Math.ceil(v * 10 ** 18)),
              });
            }}
            inputMode="decimal"
            size="sm"
            className="w-full sm:w-96"
            placeholder="0.00"
            // endContent={<UpdatePricingCurrency />}
            endContent={
              <Input
                classNames={{
                  base: 'w-32',
                  input: 'uppercase text-base',
                }}
                value={data.currency}
                onValueChange={(v) => {
                  console.log('data v', v);
                  setStepData(currentStep, {
                    currency: v,
                  });
                }}
                label=""
                labelPlacement="outside"
                placeholder="USD"
              />
            }
            startContent={
              <div className="pointer-events-none flex w-32  items-center">
                <span className="text-default-400 text-small">
                  1 {network?.nativeCurrency?.symbol} ={' '}
                </span>
              </div>
            }
          />
        )}

        {/* connect wallet */}
        <ConnectButton>
          {/* connected */}
          <>
            <RadioGroup
              label="Please choose a signature strategy"
              value={data.signatureStrategy}
              onValueChange={(v) => {
                setStepData(currentStep, {
                  signatureStrategy: v,
                });
              }}
            >
              {Object.keys(signatureStrategies).map((key) => {
                return (
                  <Radio value={key}>
                    {signatureStrategies[key].description}
                  </Radio>
                );
              })}
            </RadioGroup>
            <CheckShowTable
              key={latestDocChangeEventId + 'CheckInputTable'}
              workerService={workerService.current}
              isToggle={data.isToggle}
              rate={data.rate}
              tokenSymbol={network?.nativeCurrency?.symbol}
              currency={data.currency}
            />

            {data?.validating && (
              <CheckReceipt
                key={latestDocChangeEventId + 'CheckReceipt'}
                tokenType="native"
                workerService={workerService.current}
                isToggle={data.isToggle}
                rate={data.rate}
                currency={data.currency}
                signatureStrategy={data.signatureStrategy}
                tokenSymbol={network?.nativeCurrency?.symbol}
                network={network?.name}
                gasTokenSymbol={network?.nativeCurrency?.symbol}
                chainId={network?.id}
              />
            )}

            {data?.validating && data?.counting && (
              <Button
                key={latestDocChangeEventId + 'PrepareContinue'}
                className="my-2"
                isLoading={isLoading}
                fullWidth
                color="secondary"
                onPress={async () => {
                  setLoading(true);
                  if (workerService.current) {
                    const results: any = await firstValueFrom(
                      // biome-ignore lint/style/noNonNullAssertion: reason
                      workerService.current?.request('getData', {
                        rate: data.rate,
                        enablePricingCurrency: data.isToggle,
                        decimals: network?.nativeCurrency?.decimals,
                      })!,
                    );

                    console.log({ results });

                    // chainId: number,
                    // rate: bigint,
                    // enablePricingCurrency: boolean,
                    // currency: string,
                    // total_recipients: number,
                    // total_transactions: number,
                    // total_input_amount: bigint,
                    // total_token_amount: bigint,
                    // tool_fee: bigint,
                    // signatureStrategy: string,
                    // connected_wallet_address: Hex,
                    // receipts: Receipt[],
                    // tokenAddress: Hex,
                    // decimal: number,
                    // symbol: string,
                    // gas_limit: bigint,
                    // gas_price: bigint,
                    await generateMultisendTask(
                      network.id,
                      data.rate,
                      data.isToggle,
                      data.currency,
                      results.total_recipients,
                      results.total_transactions,
                      results.total_input_amount,
                      results.total_token_amount,
                      0n,
                      data.signatureStrategy,
                      loginAddress,
                      results.receipts,
                      ZERO_ADDRESS,
                      network?.nativeCurrency?.decimals,
                      network?.nativeCurrency?.symbol,
                      1000000n,
                      100000000n,
                    );

                    //   await generateMultisendTask(network.id, data.rate, network?.nativeCurrency?.symbol, data.isToggle, data.decimals, data.tokenAddress, data.total_recipients, data.total_transactions, data.total_input_amount, data.total_token_amount, data.tool_fee, data.signatureStrategy, data.connected_wallet_address, data.receipts, data.rate, network?.nativeCurrency?.decimals);
                  }

                  setLoading(false);

                  // export const generateMultisendTask = async (

                  // ) => {

                  // try {
                  //   console.log('continue');
                  //   setLoading(true);
                  //   await delay(1000);
                  //   await testCRUD();
                  //   setLoading(false);
                  //   setDataReady(true);
                  //   // @ts-ignore
                  //   window?.stonks?.event('Prepare-Continue-Success');
                  // } catch (e) {
                  //   console.log(e);
                  //   // @ts-ignore
                  //   window?.stonks?.event('Prepare-Continue-failed', { e });
                  // }
                  // setLoading(false);
                }}
              >
                {isLoading && (
                  <p className="flex gap-2">
                    <MyTimer />
                    (~ 60 s) Generating...
                  </p>
                )}
                {!isLoading && 'Continue'}
              </Button>
            )}
          </>
        </ConnectButton>
      </EditorRefContext.Provider>
    </>
  );
};
