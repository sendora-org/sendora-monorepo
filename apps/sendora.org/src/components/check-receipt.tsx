import H3Title from '@/components/h3-title';
import H4Title from '@/components/h4-title';
import { numberFormats } from '@/constants/common';
import { MAX_RPC_REQUESTS_PER_SECOND } from '@/constants/common';
import { findNetwork, networks } from '@/constants/config';
import { toolFeePerUse } from '@/constants/config';
import { EditorRefContext } from '@/constants/contexts';
import useAuthStore from '@/hooks/useAuth';
import { useGasPrice } from '@/hooks/useGasPriec';
import { useLocale } from '@/hooks/useLocale';
import { useRpcStore } from '@/hooks/useRpcStore';
import { delay, getGasPrice } from '@/libs/common';
import type { WorkerService } from '@/libs/worker-service';
import { useScopedStep } from '@/providers/step-provider';
import { Button, Divider, Image } from '@heroui/react';
import { Radio, RadioGroup } from '@heroui/react';
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
  tokenSymbol: string;
  isToggle: boolean;
  currency: string;
  rate: bigint;
  network: string;
  gasTokenSymbol: string;
  chainId: number;
  tokenType: string;
  signatureStrategy: string;
};

export const CheckReceipt = ({
  workerService,
  tokenSymbol,
  isToggle,
  currency,
  rate,
  network,
  gasTokenSymbol,
  chainId,
  tokenType,
  signatureStrategy,
}: IProps) => {
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

  const transactions = useMemo(() => {
    return Math.ceil((data?.recipients ?? 0) / 100);
  }, [data]);

  const { gasPrice } = useGasPrice({
    chainId: chainId!,
  });

  const gasLimit = useMemo(() => {
    const network = findNetwork('chainId', chainId?.toString(10) ?? '1');
    let gas = 100_000n;
    if (tokenType === 'native') {
      gas = network?.gasUsedForEthTransfer ?? 100_000n;
    }

    if (tokenType === 'erc20') {
      gas = network?.gasUsedForERC20Transfer ?? 100_000n;
    }

    if (transactions > 1) {
      gas = gas * 100n;
    } else {
      gas = gas * BigInt(data?.recipients ?? 0n);
    }

    return gas + (gas * 3n) / 10n;
  }, [chainId, transactions, tokenType, data]);

  const networkCost = useMemo(() => {
    return gasPrice * gasLimit;
  }, [gasLimit, gasPrice]);

  const totalFee = useMemo(() => {
    const network = findNetwork('chainId', chainId?.toString(10) ?? '1');

    // todos
    // isValidSubscription
    // isPromoOrEvent
    const toolFee = parseEther(String(toolFeePerUse) ?? '0');
    return (networkCost + toolFee) * BigInt(transactions);
  }, [networkCost, transactions, chainId]);

  const ETHBalanceREduction = useMemo(() => {
    let reduction = totalFee;

    if (tokenType === 'native') {
      if (isToggle) {
        reduction =
          totalFee + ((data?.totalAmount ?? 0n) * BigInt(10 ** 18)) / rate;
      } else {
        reduction = totalFee + (data?.totalAmount ?? 0n);
      }
    }

    return reduction;
  }, [totalFee, tokenType, rate, data]);

  const estimatedMilliseconds = useMemo(() => {
    if (gasLimit > 0n) {
      // biome-ignore lint/style/noNonNullAssertion: reason
      const network = findNetwork('chainId', chainId?.toString(10) ?? '1')!;
      const blockTime = network?.blockTime;
      let myBlockGasLimit = (network?.blockGasLimit * 40n) / 100n;

      if (myBlockGasLimit < gasLimit) {
        myBlockGasLimit = gasLimit;
      }

      const txnsPerBlock = myBlockGasLimit / gasLimit;
      const estimatedBlocks = BigInt(transactions) / txnsPerBlock + 3n;

      return (
        estimatedBlocks * blockTime +
        BigInt(Math.ceil(transactions / MAX_RPC_REQUESTS_PER_SECOND) * 1000)
      );
    }

    return 0n;
  }, [transactions, chainId, gasLimit]);

  const setStepData = useScopedStep((s) => s.setStepData);
  const currentStep = useScopedStep((s) => s.currentStep);
  useEffect(() => {
    if (data && (data as any)?.recipients > 0) {
      setStepData(currentStep, {
        counting: true,
      });
    } else {
      setStepData(currentStep, {
        counting: false,
      });
    }
  }, [data, currentStep, setStepData]);

  return (
    <>
      {data && (data as any)?.recipients > 0 && (
        <>
          <div className="mt-2">
            <H3Title>Receipt</H3Title>
          </div>
          <div className="flex md:flex-row flex-col items-start w-full justify-between">
            <ReceiptOverview
              isTogglePricingCurrency={isToggle}
              tokenSymbol={tokenSymbol}
              pricingCurrency={currency}
              rate={rate}
              network={network}
              gasTokenSymbol={gasTokenSymbol}
              totalAmount={data?.totalAmount}
              recipients={data?.recipients}
              transactions={transactions}
              signatureStrategy={signatureStrategy}
            />
            <ReceiptCost
              // biome-ignore lint/style/noNonNullAssertion: reason
              chainId={chainId!}
              gasTokenSymbol={gasTokenSymbol}
              recipients={data?.recipients}
              transactions={transactions}
              gasLimit={gasLimit}
              estimatedMilliseconds={estimatedMilliseconds}
              gasPrice={gasPrice}
              networkCost={networkCost}
              totalFee={totalFee}
              ETHBalanceREduction={ETHBalanceREduction}
            />
          </div>
        </>
      )}
    </>
  );
};
