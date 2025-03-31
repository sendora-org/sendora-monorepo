'use client';
import React from 'react';

import { Switch } from '@heroui/react';

import UpdatePricingCurrency from '@/components/update-pricing-currency';
import { useCurrencyStore } from '@/hooks/useCurrencyStore';
import { NumberInput } from '@heroui/react';
import { TooltipNotice } from './tooltip-notice';
import { TooltipQuestion } from './tooltip-question';

export default ({ symbol = 'ETH' }: { symbol: string }) => {
  const [isSelected, setIsSelected] = React.useState(false);
  const { codes, addCode, selectedCode, setCode, removeCode, clearCodes } =
    useCurrencyStore();
  return (
    <div className="flex flex-col sm:flex-row w-full gap-2 my-2 justify-between h-[48px]">
      <div className="flex items-center">
        <Switch
          isSelected={isSelected}
          onValueChange={setIsSelected}
          aria-label="exchange rate"
        >
          Pricing Currency: {isSelected ? selectedCode : symbol}
        </Switch>

        {!isSelected && (
          <TooltipQuestion>
            <p className=" w-max-[250px]">
              If you want to calculate the amount of{' '}
              <span className="font-bold">{symbol}</span> to send in another
              currency, please enable this option.
            </p>
          </TooltipQuestion>
        )}

        {isSelected && (
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

      {isSelected && (
        <NumberInput
          hideStepper
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
