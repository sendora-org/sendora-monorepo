import H4Title from '@/components/h4-title';
import { numberFormats } from '@/constants/common';
import { useLocale } from '@/hooks/useLocale';
import { formatBigIntNumber } from '@/libs/number';
import { Divider } from '@heroui/react';

type IProps = {
  network: string;
  tokenSymbol: string;
  pricingCurrency: string;
  rate: string;
  totalAmount: string;
  recipients: number;
};

export const ReceiptOverview = ({
  network = 'Ethereum',
  tokenSymbol = 'ETH',
  pricingCurrency = 'ETH',
  rate = '1000000000000000000',
  totalAmount = '0',
  recipients = 0,
}: IProps) => {
  const { locale } = useLocale();
  const { decimalSeparator, thousandSeparator } = numberFormats[locale];

  return (
    <dl className="flex flex-col gap-4 py-4 w-full md:w-[350px]">
      <H4Title>
        <span className="font-bold">Overview</span>
      </H4Title>

      <div className="flex justify-between">
        <dt className="text-small text-default-300">Network</dt>
        <dd className="text-small font-semibold text-default-500">{network}</dd>
      </div>

      <div className="flex justify-between">
        <dt className="text-small text-default-300">Token</dt>
        <dd className="text-small font-semibold text-default-500">
          {tokenSymbol}
        </dd>
      </div>

      {!(tokenSymbol === pricingCurrency && rate === '1000000000000000000') && (
        <div className="flex justify-between">
          <dt className="text-small text-default-300">Pricing Currency</dt>
          <dd className="text-small font-semibold text-default-500">
            {pricingCurrency}
          </dd>
        </div>
      )}

      {!(tokenSymbol === pricingCurrency && rate === '1000000000000000000') && (
        <div className="flex justify-between">
          <dt className="text-small text-default-300">Rate</dt>
          <dd className="text-small font-semibold text-default-500">
            1ETH ={' '}
            {formatBigIntNumber(
              BigInt(rate) as bigint,
              thousandSeparator,
              decimalSeparator,
            )}{' '}
            {pricingCurrency}
          </dd>
        </div>
      )}

      {!(tokenSymbol === pricingCurrency && rate === '1000000000000000000') && (
        <div className="flex justify-between">
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

      <div className="flex justify-between">
        <dt className="text-small text-default-300">
          {tokenSymbol} Amount to Send
        </dt>
        <dd className="text-small font-semibold text-default-500">
          {formatBigIntNumber(
            (BigInt(totalAmount) as bigint) / BigInt(rate),
            thousandSeparator,
            decimalSeparator,
          )}{' '}
          {tokenSymbol}
        </dd>
      </div>

      <div className="flex justify-between">
        <dt className="text-small text-default-300">Recipients</dt>
        <dd className="text-small font-semibold text-default-500">
          {formatBigIntNumber(
            BigInt(recipients) * BigInt(10 ** 18),
            thousandSeparator,
            decimalSeparator,
          )}
        </dd>
      </div>

      <Divider />
    </dl>
  );
};
