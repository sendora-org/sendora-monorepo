import H3Title from '@/components/h3-title';
import H4Title from '@/components/h4-title';
import { numberFormats } from '@/constants/common';
import { findNetwork, networks } from '@/constants/config';
import { EditorRefContext } from '@/constants/contexts';
import useAuthStore from '@/hooks/useAuth';
import { useLocale } from '@/hooks/useLocale';
import { delay, getGasPrice } from '@/libs/common';
import type { WorkerService } from '@/libs/worker-service';
import { Button, Divider, Image } from '@heroui/react';
import { useQueryClient } from '@tanstack/react-query';
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

export const ConfirmReceipt = ({
  workerService,

  eventSubject,
  loginAddress,
  chainId,
  isToggle,
  tokenSymbol,
  currency,
  rate,
  tokenType,
}: {
  workerService: WorkerService | null;
  eventSubject: Subject<{ event: string }>;
  loginAddress?: Hex;
  chainId?: number;

  isToggle: boolean;
  tokenSymbol: string;
  currency: string;
  rate: bigint;
  tokenType: string;
}) => {
  const { locale } = useLocale();
  const [isDataReady, setDataReady] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0n);
  const [recipients, setRecipients] = useState(0);
  const [gasPrice, setGasPrice] = useState(0n);

  const [isError, setError] = useState(false);
  const editorRef = useContext(EditorRefContext);

  const queryClient = useQueryClient();

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

  async function testCRUD() {
    if (workerService) {
      const result = await firstValueFrom(workerService?.request('count'));
      console.log('count result:', result);
      return result;
    }

    return null;
  }

  console.log({ isLoading });

  const network = useMemo(() => {
    const network = findNetwork('chainId', chainId?.toString(10) ?? '1');
    return network?.name ?? 'Ethereum';
  }, [chainId]);

  const gasTokenSymbol = useMemo(() => {
    const network = findNetwork('chainId', chainId?.toString(10) ?? '1');
    return network?.symbol ?? 'ETH';
  }, [chainId]);

  const pricingCurrency = useMemo(() => {
    if (isToggle && rate > 0) {
      return currency;
    }
    return tokenSymbol;
  }, [isToggle, currency, rate, tokenSymbol]);
  console.log({ network, isToggle });

  const transactions = useMemo(() => {
    return Math.ceil(recipients / 100);
  }, [recipients]);

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
      gas = gas * BigInt(recipients);
    }

    return gas + (gas * 3n) / 10n;
  }, [chainId, transactions, tokenType, recipients]);

  const networkCost = useMemo(() => {
    return gasPrice * gasLimit;
  }, [gasLimit, gasPrice]);

  const totalFee = useMemo(() => {
    const network = findNetwork('chainId', chainId?.toString(10) ?? '1');

    // todos
    // isValidSubscription
    // isPromoOrEvent
    const toolFee = parseEther(String(network?.toolFeePerUse) ?? '0');
    return (networkCost + toolFee) * BigInt(transactions);
  }, [networkCost, transactions, chainId]);

  const ETHBalanceREduction = useMemo(() => {
    let reduction = totalFee;

    if (tokenType === 'native') {
      reduction = totalFee + totalAmount;
    }

    return reduction;
  }, [totalFee, tokenType, totalAmount]);

  const estimatedMilliseconds = useMemo(() => {
    console.log({ gasLimit });
    if (gasLimit > 0n) {
      // biome-ignore lint/style/noNonNullAssertion: reason
      const network = findNetwork('chainId', chainId?.toString(10) ?? '1')!;
      const blockTime = network?.blockTime;
      const halfBlockGasLimit = (network?.blockGasLimit * 50n) / 100n;

      console.log({ halfBlockGasLimit }, network?.blockGasLimit, gasLimit)
      const txnsPerBlock = halfBlockGasLimit / gasLimit;
      const estimatedBlocks = BigInt(transactions) / txnsPerBlock + 3n;

      console.log('gasLimit', {
        estimatedBlocks,
        transactions,
        txnsPerBlock,
        halfBlockGasLimit,
      });
      return estimatedBlocks * blockTime;
    }

    return 0n;
  }, [transactions, chainId, gasLimit]);
  return (
    <>
      {!isDataReady && (
        <Button
          className="my-2"
          isLoading={isLoading}
          fullWidth
          color="secondary"
          onPress={async () => {
            // status valid  duplicateAddress
            //  amount recipients

            // type IProps = {
            //     network: string;
            //     tokenSymbol: string;
            //     pricingCurrency: string;
            //     rate: string;
            //     totalAmount: string;
            //     recipients: number;
            //     transactions: number;
            //   };

            try {
              console.log('continue');
              setLoading(true);
              await delay(1000);
              const result = await testCRUD();

              // biome-ignore lint/style/noNonNullAssertion: reason
              const gasPrice = await getGasPrice(chainId!);

              if (result) {
                // @ts-ignore
                setTotalAmount(result.totalAmount);
                // @ts-ignore
                setRecipients(result.recipients);
                setGasPrice(gasPrice);
              }
              setLoading(false);

              setDataReady(true);

              // @ts-ignore
              // window?.stonks.event('Prepare-Continue-Success');
            } catch (e) {
              console.log(e);
              // @ts-ignore
              // window?.stonks.event('Prepare-Continue-failed', { e });
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
        <>
          <div className="mt-2">
            <H3Title>Receipt</H3Title>
          </div>
          <div className="flex md:flex-row flex-col items-start w-full justify-between">
            <ReceiptOverview
              isTogglePricingCurrency={isToggle}
              network={network}
              tokenSymbol={tokenSymbol}
              pricingCurrency={pricingCurrency}
              gasTokenSymbol={gasTokenSymbol}
              rate={rate}
              totalAmount={totalAmount}
              recipients={recipients}
              transactions={transactions}
            />
            <ReceiptCost
              // biome-ignore lint/style/noNonNullAssertion: reason
              chainId={chainId!}
              gasTokenSymbol={gasTokenSymbol}
              gasPrice={gasPrice}
              gasLimit={gasLimit}
              transactions={transactions}
              recipients={recipients}
              networkCost={networkCost}
              totalFee={totalFee}
              ETHBalanceREduction={ETHBalanceREduction}
              estimatedMilliseconds={estimatedMilliseconds}
            />
          </div>
        </>
      )}
    </>
  );
};
