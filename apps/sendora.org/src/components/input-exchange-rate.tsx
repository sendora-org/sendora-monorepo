'use client';
import type React from 'react';

import { Switch } from '@heroui/react';

import UpdatePricingCurrency from '@/components/update-pricing-currency';
import { numberFormats } from '@/constants/common';
import { useCurrencyStore } from '@/hooks/useCurrencyStore';
import { useLocale } from '@/hooks/useLocale';
import { formatBigIntNumber } from '@/libs/number';
import { NumberInput } from '@heroui/react';
import { TooltipNotice } from './tooltip-notice';
import { TooltipQuestion } from './tooltip-question';
export default ({
  symbol = 'ETH',
  isToggle,
  setToggle,
  rate,
  setRate,
}: {
  symbol: string;
  isToggle: boolean;
  setToggle: React.Dispatch<React.SetStateAction<boolean>>;
  rate: bigint;
  setRate: React.Dispatch<React.SetStateAction<bigint>>;
}) => {
  const { codes, addCode, selectedCode, setCode, removeCode, clearCodes } =
    useCurrencyStore();

  const { locale } = useLocale();
  const { decimalSeparator, thousandSeparator, hdLng } = numberFormats[locale];

  return (
    <div className="flex flex-col sm:flex-row w-full gap-2 my-2 justify-between h-[96px] sm:h-[48px]">
      <div className="flex items-center">
        <Switch
          isSelected={isToggle}
          onValueChange={setToggle}
          aria-label="exchange rate"
        >
          Pricing Currency: {isToggle ? selectedCode : symbol}
        </Switch>

        {!isToggle && (
          <TooltipQuestion>
            <p className=" w-max-[250px]">
              If you want to calculate the amount of{' '}
              <span className="font-bold">{symbol}</span> to send in another
              currency, please enable this option.
            </p>
          </TooltipQuestion>
        )}

        {isToggle && (
          <TooltipQuestion>
            <p className=" w-max-[250px]">
              {' '}
              If the amount you entered is already in{' '}
              <span className="font-bold">{symbol}</span>, please disable this
              option.
            </p>
          </TooltipQuestion>
        )}
      </div>

      {isToggle && (
        <NumberInput
          hideStepper
          formatOptions={{
            useGrouping: true,
            minimumFractionDigits: 0,
            maximumFractionDigits: 20,
          }}
          isRequired
          classNames={{
            input: 'text-base ',
          }}
          minValue={0}
          value={Number(rate) / 10 ** 18}
          onValueChange={(v) => {
            setRate(BigInt(Math.ceil(v * 10 ** 18)));
          }}
          inputMode="decimal"
          size="sm"
          className="w-full sm:w-96"
          placeholder="0.00"
          endContent={<UpdatePricingCurrency />}
          startContent={
            <div className="pointer-events-none flex w-32  items-center">
              <span className="text-default-400 text-small">1 {symbol} = </span>
            </div>
          }
        />
      )}
    </div>
  );
};
