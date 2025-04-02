import H3Title from '@/components/h3-title';
import H4Title from '@/components/h4-title';
import { numberFormats } from '@/constants/common';
import { EditorRefContext } from '@/constants/contexts';
import useAuthStore from '@/hooks/useAuth';
import { useLocale } from '@/hooks/useLocale';
// import { runWorker } from '@/libs/common';
// import { runWorker2 } from '@/libs/common';
// import CheckTable from '@/components/check-table';
// import type { IReceipent } from '@/components/check-table';
// import CheckTable2 from '@/components/check-table2';
// import { local2NumberFormat } from '@/constants/common';
// import { useLocale } from '@/hooks/useLocale';
// import { useNativeCoinsValue } from '@/hooks/useNativeCoinsValue';
// import { getRandomNumber } from '@/libs/common';
import { splitText } from '@/libs/common';
import {
  formatLocalizedNumberWithSmallNumbers,
  getDecimalsScientific,
} from '@/libs/common';
import { delay } from '@/libs/common';
import { WorkerService } from '@/libs/worker-service';
import { Button, Image } from '@heroui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useContext } from 'react';
import { firstValueFrom } from 'rxjs';
import type { Subject } from 'rxjs';
import { useAccount } from 'wagmi';
import { Abcfc } from './abcfc';
import ConnectButton from './connect-button';
import MyTimer from './my-timer';
import ShowTable from './show-table';
import TypewriterTips from './typewriteer-tips';

export const ConfirmInput = ({
  eventSubject,
  isToggle,
  tokenSymbol,
  currency,
  rate,
}: {
  eventSubject: Subject<{ event: string }>;
  isToggle: boolean;
  tokenSymbol: string;
  currency: string;
  rate: number;
}) => {
  const { isConnected, chain, chainId } = useAccount();
  const { status } = useAuthStore();
  const { locale } = useLocale();
  const [isDataReady, setDataReady] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const workerService = useRef<WorkerService | null>(null);

  const editorRef = useContext(EditorRefContext);

  const queryClient = useQueryClient();

  useEffect(() => {
    const worker = new Worker(
      new URL('@/web-workers/userinput-validate.ts', import.meta.url),
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

  useEffect(() => {
    const subscription = eventSubject.subscribe(() => {
      setDataReady(false);

      const prefix = 'user-input-map';

      const allQueries = queryClient.getQueryCache().findAll();

      for (const query of allQueries) {
        const queryKey = query.queryKey;
        if (Array.isArray(queryKey) && queryKey[0]?.startsWith(prefix)) {
          queryClient.removeQueries({ queryKey });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [eventSubject, queryClient]);

  // const reset = async (value: string) => {
  //   if (workerService.current) {
  //     const initRes = await firstValueFrom(
  //       workerService.current.request('reset', value),
  //     );
  //     console.log('Inited:', initRes);
  //   }
  // };

  async function testCRUD() {
    if (workerService.current) {
      const initRes = await firstValueFrom(
        workerService.current.request('reset', editorRef?.current?.getValue()),
      );
      console.log('Inited:', initRes);

      // validate
      const valiteRes = await firstValueFrom(
        workerService.current.request('validate', numberFormats[locale]),
      );
      console.log('Validate:', valiteRes);
    }
  }

  console.log({ isLoading });

  return (
    <>
      <ConnectButton />

      {isConnected &&
        chain?.id === chainId &&
        status === 'authenticated' &&
        !isDataReady && (
          <Button
            className="my-2"
            isLoading={isLoading}
            fullWidth
            color="secondary"
            onPress={async () => {
              try {
                console.log('continue');
                setLoading(true);
                await delay(1000);
                await testCRUD();
                setLoading(false);

                setDataReady(true);

                // @ts-ignore
                window?.stonks.event('Prepare-Continue-Success');
              } catch (e) {
                console.log(e);
                // @ts-ignore
                window?.stonks.event('Prepare-Continue-failed', { e });
              }
              setLoading(false);
            }}
          >
            {isLoading && (
              <p className="flex gap-2">
                <MyTimer />
                Validating receipient & amount (~60s)...
              </p>
            )}
            {!isLoading && 'Continue'}
          </Button>
        )}

      {isDataReady && (
        <ShowTable
          workerService={workerService.current}
          isToggle={isToggle}
          rate={rate}
          tokenSymbol={tokenSymbol}
          currency={currency}
        />
      )}

      {/* gap-0 brightne2ss-50 grayscale sm:bg-[url("/ads/ivars-utinans-DYqYgOrj-2M-unsplash.jpg")] bg-cover bg-center */}
      <H3Title>Receipt</H3Title>
      <div className="flex md:flex-row flex-col items-start w-full justify-between">
        <Abcfc />

        <dl className="flex flex-col gap-4 py-4 w-full md:w-[350px]">
          <H4Title>
            <span className="font-bold"> Others</span>
          </H4Title>
          <div className="flex justify-between">
            <dt className="text-small text-default-300">Created at</dt>
            <dd className="text-small font-semibold text-default-500">
              25/3/2025 18:14
            </dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-small text-default-300">Receipt ID</dt>
            <dd className="text-small font-semibold text-default-500">
              V1StGXR8_Z5jdHi6B-myT
            </dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-small text-default-300"> Merkle Root</dt>
            <dd className="text-small font-semibold text-default-500">
              9b0fc92260312ce...6d53295d85f992
            </dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-small text-default-300">Created by</dt>
            <dd className="text-small font-semibold text-default-500">
              0x1345f...770ddab52ef16f2bf17
            </dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-small text-default-300">Funds from</dt>
            <dd className="text-small font-semibold text-default-500">
              0x1345f...770ddab52ef16f2bf17
            </dd>
          </div>
        </dl>
      </div>
    </>
  );
};
