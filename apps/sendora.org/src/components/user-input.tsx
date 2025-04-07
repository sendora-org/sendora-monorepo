'use client';
import DecimalSeparatorSwitch from '@/components/decimal-separator-switch';
import H3Title from '@/components/h3-title';
import ShowSample from '@/components/show-sample';
import UploadSpreadsheet from '@/components/upload-spreadsheet';
import type { IExample } from '@/constants/common';
import { useCurrencyStore } from '@/hooks/useCurrencyStore';
import { useLocale } from '@/hooks/useLocale';
import { Button, ButtonGroup } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useFullscreen } from '@mantine/hooks';
import { memo, useCallback, useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import AddAmount from './add-amount';
import SNDRACodemirror from './codemirror-sndra';
import { ConfirmInput } from './confirm-input';

import { forwardRef } from 'react';
import InputExchangeRate from './input-exchange-rate';
const SNDRACodemirrorMemo = memo(SNDRACodemirror);
const eventSubject = new Subject<{ event: string }>();
export default forwardRef(
  (
    {
      defaultValue = '',
      example,
      tokenSymbol = 'ETH',
    }: { defaultValue: string; tokenSymbol: string; example: IExample },
    ref,
  ) => {
    console.log(`user input render ${new Date().toISOString()}`);
    const { toggle, fullscreen } = useFullscreen();
    const { locale } = useLocale();
    const [isToggle, setToggle] = useState(false);
    const [rate, setRate] = useState(BigInt(10 ** 18));
    const { codes, addCode, selectedCode, setCode, removeCode, clearCodes } =
      useCurrencyStore();
    const onDocChange = useCallback(() => {
      console.log('onDocChange');
      eventSubject.next({ event: 'onDocChange' });
    }, []);

    useEffect(() => {
      if (isToggle && rate > 0) {
        eventSubject.next({ event: 'onDocChange' });
      }
    }, [isToggle, rate]);

    console.log({isToggle})

    return (
      <>
        <div className="w-full relative mb-12">
          <div className="flex w-full items-center justify-between mb-2">
            <H3Title>Recipients and amounts</H3Title>
            <UploadSpreadsheet />
          </div>
          <SNDRACodemirrorMemo
            ref={ref}
            defaultValue={defaultValue}
            onDocChange={onDocChange}
          />
          <div className="absolute -bottom-10 right-0">
            <ButtonGroup className="gap-1">
              <AddAmount />

              <ShowSample example={example[locale].content ?? ''} />
              <DecimalSeparatorSwitch />
              <Button isIconOnly size="sm" onPress={toggle}>
                <Icon
                  icon={
                    fullscreen
                      ? 'qlementine-icons:fullscreen-exit-16'
                      : 'qlementine-icons:fullscreen-16'
                  }
                  width="16"
                  height="16"
                />
              </Button>
            </ButtonGroup>
          </div>
        </div>
        <InputExchangeRate
          symbol={tokenSymbol}
          isToggle={isToggle}
          setToggle={setToggle}
          rate={rate}
          setRate={setRate}
        />
        <ConfirmInput
          eventSubject={eventSubject}
          isToggle={isToggle}
          tokenSymbol={tokenSymbol}
          currency={selectedCode}
          rate={rate}
        />
      </>
    );
  },
);
