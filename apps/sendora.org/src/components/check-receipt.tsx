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
    tokenSymbol: string;
    isToggle: boolean;
    currency: string;
    rate: bigint;
    network: string;
    gasTokenSymbol: string;
    chainId: number;
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
        return Math.ceil(data?.recipients / 100);
    }, [data]);

    console.log({ data }, 'ids');
    return (
        <>
            {/* Use input button*/}

            {/* {(typeof data == 'undefined' || data?.recipients == 0) && (
                <Button
                    className="my-2"
                    // isLoading={isLoading}
                    fullWidth
                    color="secondary"
                    onPress={async () => {
                        try {
                            setLoading(true);

                            await delay(2000);

                            setLoading(false);
                            // @ts-ignore
                        } catch (e) {
                            setLoading(false);
                            console.log(e);
                        }
                        clearCache();
                    }}
                >
                    {isLoading && (
                        <p className="flex gap-2">
                            <MyTimer />
                            (~3s) Counting...
                        </p>
                    )}
                    {!isLoading && 'Continue'}
                </Button>
            )} */}

            {/* Show receipt  view */}
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
                        />
                        <ReceiptCost
                            // biome-ignore lint/style/noNonNullAssertion: reason
                            chainId={chainId!}
                            gasTokenSymbol={gasTokenSymbol}
                            recipients={data?.recipients}
                            transactions={transactions}

                        // gasPrice={gasPrice}
                        // gasLimit={gasLimit}

                        // networkCost={networkCost}
                        // totalFee={totalFee}
                        // ETHBalanceREduction={ETHBalanceREduction}
                        // estimatedMilliseconds={estimatedMilliseconds}
                        />
                    </div>

                    <div>Select send mode</div>
                    <Button
                        className="my-2"
                        // isLoading={isLoading}
                        fullWidth
                        color="secondary"
                        onPress={async () => {
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
                        {/* {isLoading && (
                      <p className="flex gap-2">
                        <MyTimer />
                        Validating receipient & amount (~60s)...
                      </p>
                    )}
                    {!isLoading && 'Continue'} */}
                        Continue
                    </Button>
                </>
            )}
        </>
    );
};
