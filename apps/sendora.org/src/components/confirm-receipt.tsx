import H3Title from '@/components/h3-title';
import H4Title from '@/components/h4-title';
import { numberFormats } from '@/constants/common';
import { findNetwork, networks } from '@/constants/config';
import { EditorRefContext } from '@/constants/contexts';
import useAuthStore from '@/hooks/useAuth';
import { useLocale } from '@/hooks/useLocale';
import { delay } from '@/libs/common';
import type { WorkerService } from '@/libs/worker-service';
import { Button, Divider, Image } from '@heroui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useContext } from 'react';
import { firstValueFrom } from 'rxjs';
import type { Subject } from 'rxjs';
import type { Hex } from 'viem';
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
}: {
  workerService: WorkerService | null;
  eventSubject: Subject<{ event: string }>;
  loginAddress?: Hex;
  chainId?: number;

  isToggle: boolean;
  tokenSymbol: string;
  currency: string;
  rate: bigint;
}) => {
  const { locale } = useLocale();
  const [isDataReady, setDataReady] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0n);
  const [recipients, setRecipients] = useState(0);

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
  console.log({ network ,isToggle});

  const transactions = useMemo(() => {
    return Math.ceil(recipients / 100);
  }, [recipients]);
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

              if (result) {
                setTotalAmount(result.totalAmount);
                setRecipients(result.recipients);
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
            {/* <ReceiptCost /> */}
          </div>
        </>
      )}
    </>
  );
};
