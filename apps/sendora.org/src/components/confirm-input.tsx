import { numberFormats } from '@/constants/common';
import { EditorRefContext } from '@/constants/contexts';
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
import { Button } from '@heroui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useContext } from 'react';
import { firstValueFrom } from 'rxjs';
import type { Subject } from 'rxjs';
import { useAccount } from 'wagmi';
import ConnectButton from './connect-button';
import MyTimer from './my-timer';
import ShowTable from './show-table';

function clearCacheByPrefix(prefix: string) {
  const queryClient = useQueryClient();

  const allQueries = queryClient.getQueryCache().findAll();

  for (const query of allQueries) {
    const queryKey = query.queryKey;

    if (Array.isArray(queryKey) && queryKey[0]?.startsWith(prefix)) {
      queryClient.removeQueries({ queryKey });
    }
  }
}

export const ConfirmInput = ({
  eventSubject,
}: { eventSubject: Subject<{ event: string }> }) => {
  const { isConnected, chain, chainId } = useAccount();

  const { locale } = useLocale();
  const [isDataReady, setDataReady] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const workerService = useRef<WorkerService | null>(null);

  const editorRef = useContext(EditorRefContext);
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
      clearCacheByPrefix('user-input-map');
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [eventSubject]);

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

      {isConnected && chain?.id === chainId && !isDataReady && (
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

      {isDataReady && <ShowTable workerService={workerService.current} />}
      {/* <Button
        onPress={() => {
          setLoading(false);
        }}
      >
        click
      </Button>

      <Button
        onPress={async () => {
          if (workerService.current) {
            // 获取所有数据
            const allData = await firstValueFrom(
              workerService.current.request('getAll'),
            );
            console.log('All Data:', allData);
          }
        }}
      >
        query
      </Button> */}
    </>
  );
};
