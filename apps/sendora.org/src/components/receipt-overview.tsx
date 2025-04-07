import H4Title from '@/components/h4-title';
import { numberFormats } from '@/constants/common';
import { useLocale } from '@/hooks/useLocale';
import { formatBigIntNumber } from '@/libs/number';
import { Divider } from '@heroui/react';
import { TooltipQuestion } from './tooltip-question';

type IProps = {
  network: string;
  tokenSymbol: string;
  pricingCurrency: string;
  rate: bigint;
  totalAmount: bigint;
  recipients: number;
  transactions: number;
  gasTokenSymbol: string;
  isTogglePricingCurrency: boolean;
};

export const ReceiptOverview = ({
  network = 'Ethereum',
  tokenSymbol = 'ETH',
  pricingCurrency = 'ETH',
  rate = 1000000000000000000n,
  totalAmount = 0n,
  recipients = 0,
  transactions = 1,
  gasTokenSymbol = 'ETH',
  isTogglePricingCurrency
}: IProps) => {
  const { locale } = useLocale();
  const { decimalSeparator, thousandSeparator } = numberFormats[locale];

  return (
    <dl className="flex flex-col gap-2 py-4 w-full md:w-[350px]">
      <H4Title>
        <span className="font-bold">Overview</span>
      </H4Title>

      <div className="flex justify-between items-center min-h-[28px]">
        <dt className="text-small text-default-300">Network</dt>
        <dd className="text-small font-semibold text-default-500">{network}</dd>
      </div>

      <div className="flex justify-between items-center min-h-[28px]">
        <dt className="text-small text-default-300">Token</dt>
        <dd className="text-small font-semibold text-default-500">
          {tokenSymbol}
        </dd>
      </div>

      {isTogglePricingCurrency && (
        <div className="flex justify-between items-center min-h-[28px]">
          <dt className="text-small text-default-300">Pricing Currency</dt>
          <dd className="text-small font-semibold text-default-500">
            {pricingCurrency}
          </dd>
        </div>
      )}

      {isTogglePricingCurrency && (
        <div className="flex justify-between items-center min-h-[28px]">
          <dt className="text-small text-default-300">Rate</dt>
          <dd className="text-small font-semibold text-default-500">
            1 {gasTokenSymbol} ={' '}
            {formatBigIntNumber(
              BigInt(rate) as bigint,
              thousandSeparator,
              decimalSeparator,
            )}{' '}
            {pricingCurrency}
          </dd>
        </div>
      )}

      {isTogglePricingCurrency && (
        <div className="flex justify-between items-center min-h-[28px]">
          <dt className="text-small text-default-300">
            Total amount in {pricingCurrency}
          </dt>
          <dd className="text-small font-semibold text-default-500">
            {formatBigIntNumber(
              BigInt(totalAmount) as bigint,
              thousandSeparator,
              decimalSeparator,
            )}{' '}
            {pricingCurrency}
          </dd>
        </div>
      )}

      {isTogglePricingCurrency && (
        <div className="flex justify-between items-center min-h-[28px]">
          <dt className="text-small text-default-300">
            {tokenSymbol} Amount to Send
          </dt>
          <dd className="text-small font-semibold text-default-500">
            {formatBigIntNumber(
              ((BigInt(totalAmount) as bigint) * BigInt(10 ** 18)) /
              BigInt(rate),
              thousandSeparator,
              decimalSeparator,
            )}{' '}
            {tokenSymbol}
          </dd>
        </div>
      )}

      {!isTogglePricingCurrency && (
        <div className="flex justify-between items-center min-h-[28px]">
          <dt className="text-small text-default-300">
            {tokenSymbol} Amount to Send
          </dt>
          <dd className="text-small font-semibold text-default-500">
            {formatBigIntNumber(
              BigInt(totalAmount) as bigint,
              thousandSeparator,
              decimalSeparator,
            )}{' '}
            {tokenSymbol}
          </dd>
        </div>
      )}

      <div className="flex justify-between items-center min-h-[28px]">
        <dt className="text-small text-default-300">Recipients</dt>
        <dd className="text-small font-semibold text-default-500">
          {formatBigIntNumber(
            BigInt(recipients * 10 ** 18),
            thousandSeparator,
            decimalSeparator,
            0,
          )}
        </dd>
      </div>

      <div className="flex justify-between items-center min-h-[28px] items-center">
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
            0,
          )}
        </dd>
      </div>

      <Divider />
    </dl>
  );
};
