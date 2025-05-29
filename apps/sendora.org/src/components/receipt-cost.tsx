import H4Title from '@/components/h4-title';
import { numberFormats } from '@/constants/common';
import { discountedPriceTips } from '@/constants/common';
import { findNetwork } from '@/constants/config';
import { toolFeePerUse } from '@/constants/config';
import { useLocale } from '@/hooks/useLocale';
import { formatWei } from '@/libs/common';
import { formatBigIntNumber } from '@/libs/number';
import { Divider } from '@heroui/react';
// @ts-ignore
import humanizeDuration from 'humanize-duration';
import { SubscribePrompt } from './subscribe-prompt';
import { TooltipNotice } from './tooltip-notice';
import { TooltipQuestion } from './tooltip-question';

type IProps = {
  estimatedMilliseconds: bigint;
  gasPrice: bigint;
  gasLimit: bigint;
  networkCost: bigint;
  totalFee: bigint;
  gasTokenSymbol: string;
  ETHBalanceREduction: bigint;
  chainId: number;
  isValidSubscription?: boolean;
  isPromoOrEvent?: boolean;
  promoOrEventPrice?: number;
  discountedPriceTip?: string;
  transactions: number;
  recipients: number;
};

export const ReceiptCost = ({
  estimatedMilliseconds = 1000n * 0n,
  gasPrice = 0n,
  gasTokenSymbol = 'ETH',
  networkCost = 0n,
  totalFee = 0n,
  ETHBalanceREduction = 0n,
  gasLimit = 0n,
  chainId = 1,
  isValidSubscription = false,
  isPromoOrEvent = false,
  promoOrEventPrice = 0,
  discountedPriceTip = discountedPriceTips[0],
  transactions,
  recipients,
}: IProps) => {
  // console.log({ gasPrice: formatWei(gasPrice.toString()) }, gasPrice);
  const { locale } = useLocale();
  const { decimalSeparator, thousandSeparator, hdLng } = numberFormats[locale];

  const network = findNetwork('chainId', chainId.toString(10)) ?? null;

  return (
    <dl className="flex flex-col gap-2 py-4 w-full md:w-[400px]  ">
      <H4Title>
        <span className="font-bold">Transaction Cost </span>
      </H4Title>

      <div className="flex justify-between min-h-[28px] items-center">
        <dt className="text-small text-default-400">Estimated time</dt>
        <dd className="text-small font-semibold text-default-500">
          {humanizeDuration(Number(estimatedMilliseconds), { language: hdLng })}
        </dd>
      </div>
      <div className="flex justify-between min-h-[28px] items-center">
        <dt className="text-small text-default-400">Gas Price</dt>
        <dd className="text-small font-semibold text-default-500">
          {formatWei(gasPrice.toString())}
        </dd>
      </div>

      {/* <div className="flex justify-between items-center min-h-[28px] items-center">
        <dt className="text-small text-default-400 flex items-center ">
          Transactions{' '}
          <TooltipQuestion iconClassName="h-[16px] w-[16px]">
            <p className=" w-max-[250px]">
              Up to 100 recipients per transaction
            </p>
          </TooltipQuestion>
        </dt>
        <dd className="text-small font-semibold text-default-500">
          {formatBigIntNumber(
            BigInt(transactions) * BigInt(10 ** 18),
            thousandSeparator,
            decimalSeparator,
            0,
          )}
        </dd>
      </div> */}

      <div className="flex justify-between min-h-[28px] items-center">
        <dt className="text-small text-default-400">Gas Limit/Tx</dt>
        <dd className="text-small font-semibold text-default-500">
          {formatBigIntNumber(
            gasLimit * BigInt(10 ** 18),
            thousandSeparator,
            decimalSeparator,
          )}
        </dd>
      </div>

      <div className="flex justify-between min-h-[28px] items-center">
        <dt className="text-small text-default-400 flex items-center">
          Network Fee/Tx{' '}
          <TooltipQuestion iconClassName="h-[14px] w-[14px]">
            <p className=" w-max-[250px]">
              The network fee for a transaction, paid to miners, is Gas Price ×
              Gas Limit.
            </p>
          </TooltipQuestion>
        </dt>
        <dd className="text-small font-semibold text-default-500">
          {' '}
          {formatBigIntNumber(networkCost, thousandSeparator, decimalSeparator)}{' '}
          {gasTokenSymbol}
        </dd>
      </div>

      <div className="flex justify-between min-h-[28px] items-center">
        <dt className="text-small text-default-400 flex items-center">
          Tool Fee/Tx{' '}
          <TooltipQuestion iconClassName="h-[14px] w-[14px]">
            <p className=" w-max-[250px]">
              The Tool fee for a transaction, paid to sendora.org.
            </p>
          </TooltipQuestion>
        </dt>

        {(isValidSubscription || isPromoOrEvent) && (
          <div className="flex items-center">
            <dd className="text-small font-semibold text-default-500 line-through">
              {toolFeePerUse} {gasTokenSymbol}
            </dd>

            <TooltipNotice>{discountedPriceTip}</TooltipNotice>

            <dd className="text-small font-semibold text-default-500 ">
              {promoOrEventPrice} {gasTokenSymbol}
            </dd>
          </div>
        )}

        {!isValidSubscription && !isPromoOrEvent && (
          <dd className="text-small font-semibold text-default-500">
            {toolFeePerUse} {gasTokenSymbol}
          </dd>
        )}
      </div>

      <div className="flex justify-between min-h-[28px] items-center">
        <dt className="text-small text-default-400 flex items-center">
          Total Fee{' '}
          <TooltipQuestion iconClassName="h-[14px] w-[14px]">
            <p className=" w-max-[250px]">
              Total Fee = (Network Fee per Transaction + Tool Fee per
              Transaction) × Number of Transactions
            </p>
          </TooltipQuestion>
        </dt>

        <dd className="text-small font-semibold text-default-500">
          {' '}
          {formatBigIntNumber(totalFee, thousandSeparator, decimalSeparator)}{' '}
          {gasTokenSymbol}
        </dd>
      </div>

      {!isValidSubscription && <SubscribePrompt />}

      <div className="flex justify-between min-h-[28px] items-center">
        <dt className="text-small text-default-400 flex items-center">
          {gasTokenSymbol} Balance Reduction
          <TooltipQuestion iconClassName="h-[14px] w-[14px]">
            <p className=" w-max-[250px]">
              {gasTokenSymbol} Balance Reduction = Total Fee + {gasTokenSymbol}{' '}
              Amount to Send
            </p>
          </TooltipQuestion>
        </dt>
        <dd className="text-small font-semibold text-default-500">
          {' '}
          <dd className="text-small font-semibold text-default-500">
            {' '}
            {formatBigIntNumber(
              ETHBalanceREduction,
              thousandSeparator,
              decimalSeparator,
              4,
            )}{' '}
            {gasTokenSymbol}
          </dd>
        </dd>
      </div>
      {/* <Divider /> */}
    </dl>
  );
};
