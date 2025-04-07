import H3Title from '@/components/h3-title';
import H4Title from '@/components/h4-title';
import { numberFormats } from '@/constants/common';
import { useLocale } from '@/hooks/useLocale';
import { formatBigIntNumber } from '@/libs/number';
import { Divider } from '@heroui/react';
import { TooltipQuestion } from './tooltip-question';

import { formatWei } from '@/libs/common';
// @ts-ignore
import humanizeDuration from 'humanize-duration';

type IProps = {
  transactions: number;
  estimatedMilliseconds: number;
  gasPrice: string;
  networkCost: string;
  totalFee: string;
  gasTokenSymbol: string;
  ETHDecreaseAmount: string;
};

export const ReceiptCost = ({
  transactions = 1,
  estimatedMilliseconds = 1000 * 0,
  gasPrice = '1',
  gasTokenSymbol = 'ETH',
  networkCost = '0',
  totalFee = '0',
  ETHDecreaseAmount = '0',
}: IProps) => {
  const { locale } = useLocale();
  const { decimalSeparator, thousandSeparator, hdLng } = numberFormats[locale];

  return (
    <dl className="flex flex-col gap-4 py-4 w-full md:w-[350px]">
      <H4Title>
        <span className="font-bold">Transaction Cost </span>
      </H4Title>

      <div className="flex justify-between">
        <dt className="text-small text-default-300 flex items-center ">
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
          )}
        </dd>
      </div>

      <div className="flex justify-between">
        <dt className="text-small text-default-300">Estimated time</dt>
        <dd className="text-small font-semibold text-default-500">
          {humanizeDuration(estimatedMilliseconds, { language: hdLng })}
        </dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-small text-default-300">Gas Price</dt>
        <dd className="text-small font-semibold text-default-500">
          {formatWei(gasPrice)}
        </dd>
      </div>

      <div className="flex justify-between">
        <dt className="text-small text-default-300 flex items-center">
          Network Fee/Tx{' '}
          <TooltipQuestion iconClassName="h-[16px] w-[16px]">
            <p className=" w-max-[250px]">
              The network fee for a transaction, paid to miners, is Gas Price ×
              Gas Limit.
            </p>
          </TooltipQuestion>
        </dt>
        <dd className="text-small font-semibold text-default-500">
          {' '}
          {formatBigIntNumber(
            BigInt(networkCost) as bigint,
            thousandSeparator,
            decimalSeparator,
          )}{' '}
          {gasTokenSymbol}
        </dd>
      </div>

      <div className="flex justify-between">
        <dt className="text-small text-default-300 flex items-center">
          Total Fee{' '}
          <TooltipQuestion iconClassName="h-[16px] w-[16px]">
            <p className=" w-max-[250px]">
              Total Fee = (Network Fee per Transaction + Tool Fee per
              Transaction) × Number of Transactions
            </p>
          </TooltipQuestion>
        </dt>
        <dd className="text-small font-semibold text-default-500">
          {' '}
          {formatBigIntNumber(
            BigInt(totalFee) as bigint,
            thousandSeparator,
            decimalSeparator,
          )}{' '}
          {gasTokenSymbol}
        </dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-small text-default-300 flex items-center">
          {gasTokenSymbol} Balance Reduction
          <TooltipQuestion iconClassName="h-[16px] w-[16px]">
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
              BigInt(ETHDecreaseAmount) as bigint,
              thousandSeparator,
              decimalSeparator,
            )}{' '}
            {gasTokenSymbol}
          </dd>
        </dd>
      </div>
      <Divider />
    </dl>
  );
};
