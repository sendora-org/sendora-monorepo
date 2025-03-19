'use client';
import React from 'react';

import { Switch } from '@heroui/react';

import { NumberInput } from '@heroui/react';

export default ({ symbol = 'ETH' }: { symbol: string }) => {
  const [isSelected, setIsSelected] = React.useState(false);

  return (
    <div className="flex flex-col sm:flex-row w-full gap-2 my-2 justify-between">
      <Switch
        isSelected={isSelected}
        onValueChange={setIsSelected}
        aria-label="exchange rate"
      >
        {!isSelected && `Enable when not ${symbol}`}
        {isSelected && `Disable if ${symbol}`}
      </Switch>

      {isSelected && (
        <NumberInput
          size="sm"
          className="w-full sm:w-96"
          placeholder="0.00"
          endContent={
            <div className="flex items-center">
              <label className="sr-only" htmlFor="currency">
                Currency
              </label>
              <select
                aria-label="Select currency"
                className="outline-none border-0 bg-transparent text-default-400 text-small"
                defaultValue="USD"
                id="currency"
                name="currency"
              >
                <option aria-label="United States Dollar" value="USD">
                  USD
                </option>
                <option aria-label="Euro" value="EUR">
                  EUR
                </option>
                <option aria-label="Pound Sterling" value="GBP">
                  GBP
                </option>
                <option aria-label="Japanese Yen" value="JPY">
                  JPY
                </option>
                <option aria-label="Chinese Yuan" value="CNY">
                  CNY
                </option>
                <option aria-label="Hong Kong Dollar" value="HKD">
                  HKD
                </option>
                <option aria-label="Australian Dollar" value="AUD">
                  AUD
                </option>
                <option aria-label="Canadian Dollar" value="CAD">
                  CAD
                </option>
                <option aria-label="Swiss Franc" value="CHF">
                  CHF
                </option>
                <option aria-label="Singapore Dollar" value="SGD">
                  SGD
                </option>
                <option aria-label="New Zealand Dollar" value="NZD">
                  NZD
                </option>
                <option aria-label="South Korean Won" value="KRW">
                  KRW
                </option>
                <option aria-label="Indian Rupee" value="INR">
                  INR
                </option>
                <option aria-label="Russian Ruble" value="RUB">
                  RUB
                </option>
                <option aria-label="Brazilian Real" value="BRL">
                  BRL
                </option>
                <option aria-label="South African Rand" value="ZAR">
                  ZAR
                </option>
                <option aria-label="Other Currency" value="OTHER">
                  Other
                </option>
              </select>
            </div>
          }
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
