
import H3Title from '@/components/h3-title';
import H4Title from '@/components/h4-title';
import { numberFormats } from '@/constants/common';
import { MAX_RPC_REQUESTS_PER_SECOND } from '@/constants/common';
import { findNetwork, networks } from '@/constants/config';
import { EditorRefContext } from '@/constants/contexts';
import useAuthStore from '@/hooks/useAuth';
import { useLocale } from '@/hooks/useLocale';
import { useRpcStore } from '@/hooks/useRpcStore';
import { delay, getGasPrice } from '@/libs/common';
import type { WorkerService } from '@/libs/worker-service';
import { Button, Divider, Image } from '@heroui/react';
import { useQueryClient } from '@tanstack/react-query';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useContext } from 'react';
import { firstValueFrom } from 'rxjs';
import type { Subject } from 'rxjs';
import type { Hex } from 'viem';
import { parseEther } from 'viem';
import { useAccount } from 'wagmi';
import { Abcfc } from './abcfc';
import ConnectButton from './connect-button';
import MyTimer from './my-timer';
import { ReceiptCost } from './receipt-cost';
import { ReceiptOverview } from './receipt-overview';
import ShowTable from './show-table';
import TypewriterTips from './typewriteer-tips';
type IProps = {
  //   deleteLine: (line: number[]) => void;
  workerService: WorkerService | null;
  // tokenSymbol: string;
  // isToggle: boolean;
  // currency: string;
  // rate: bigint;
};


export const CheckWriteDB = ({
  workerService,
  // tokenSymbol,
  // isToggle,
  // currency,
  // rate,
}: IProps) => {
  useEffect(() => {
    console.log('CheckWriteDB onmount');

    return () => {
      console.log('CheckWriteDB clean up');
    };
  }, []);


  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  useEffect(() => {
    console.log('CheckReceipt onmount');

    return () => {
      console.log('CheckReceipt clean up');
      if (workerService) {
        clearCache();
      }
    };
  }, []);

  const { status, data, error, isFetching, isPlaceholderData, refetch } =
    useQuery({
      queryKey: ['user-input-map', 'count'],
      // cacheTime: 0,
      staleTime: 0,
      queryFn: () =>
        firstValueFrom(
          // biome-ignore lint/style/noNonNullAssertion: reason
          workerService?.request('count')!,
        ),

      placeholderData: keepPreviousData,
      refetchInterval: 2000,
    });

  const clearCache = () => {
    const prefix = 'user-input-map';

    const allQueries = queryClient.getQueryCache().findAll();

    for (const query of allQueries) {
      const queryKey = query.queryKey;
      if (Array.isArray(queryKey) && queryKey[0]?.startsWith(prefix)) {
        queryClient.removeQueries({ queryKey });
      }
    }
  };
  return (
    <>
      {/* Write to db button */}

      {/* Select send mode view */}

    </>
  );
};
