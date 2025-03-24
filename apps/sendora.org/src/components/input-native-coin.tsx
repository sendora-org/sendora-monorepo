'use client';
import CheckTable from '@/components/check-table';
import type { IReceipent } from '@/components/check-table';
import DecimalSeparatorSwitch from '@/components/decimal-separator-switch';
import H3Title from '@/components/h3-title';
import ShowSample from '@/components/show-sample';
import UploadSpreadsheet from '@/components/upload-spreadsheet';
import { native_coin_input_example } from '@/constants/common';
import { type NFType, numberFormats } from '@/constants/common';
import { local2NumberFormat } from '@/constants/common';
import { useLocale } from '@/hooks/useLocale';
import { useNativeCoinsValue } from '@/hooks/useNativeCoinsValue';
import { getRandomNumber } from '@/libs/common';
import { splitText } from '@/libs/common';
import {
  formatLocalizedNumberWithSmallNumbers,
  getDecimalsScientific,
} from '@/libs/common';
import { runWorker } from '@/libs/common';
import { Button, ButtonGroup } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useFullscreen } from '@mantine/hooks';
import { useRef } from 'react';
import { useState } from 'react';
import AddAmount from './add-amount';
import SNDRACodemirror, { type SNDRACodemirrorRef } from './codemirror-sndra';

export default () => {
  const { toggle, fullscreen } = useFullscreen();
  const { value, setValue } = useNativeCoinsValue();

  const [checkValue, setCheckValue] = useState<IReceipent[]>([]);

  const onChange = (val: string) => {
    // setValue(val);
    setCheckValue([]);
  };

  const editorRef = useRef<SNDRACodemirrorRef | null>(null);

  const { setLocale, locale } = useLocale();
  // const [selectedKeys, setSelectedKeys] = useState(new Set(['USA']));

  const format = local2NumberFormat[locale];
  const { decimalSeparator, thousandSeparator, code, useGrouping } =
    numberFormats[format as NFType];

  const updateAmount = (
    isRandom = false,
    fixedValue = 0.01,
    minValue = 0.01,
    maxValue = 10,
    decimals = 2,
  ) => {
    const value = editorRef?.current?.getValue() ?? '';
    if (!isRandom) {
      const decimals2 = getDecimalsScientific(fixedValue);
      setValue(
        value
          .split('\n')
          .map((item) => {
            return `${splitText(item)[0]},${formatLocalizedNumberWithSmallNumbers(fixedValue, decimalSeparator, thousandSeparator, decimals2)}`;
          })
          .join('\n'),
      );
    } else {
      setValue(
        value
          .split('\n')
          .map((item) => {
            return `${splitText(item)[0]},${formatLocalizedNumberWithSmallNumbers(getRandomNumber(minValue, maxValue, decimals), decimalSeparator, thousandSeparator, decimals)}`;
          })
          .join('\n'),
      );
    }
  };

  return (
    <>
      <div className="w-full relative mb-12">
        <div className="flex w-full items-center justify-between mb-2">
          <H3Title>Recipients and amounts</H3Title>
          <UploadSpreadsheet />
        </div>

        <SNDRACodemirror
          ref={editorRef}
          value={value}
          onChange={onChange}
          fullscreen={fullscreen}
        />

        <div className="absolute -bottom-10 right-0">
          <ButtonGroup className="gap-1">
            <AddAmount
              updateAmount={updateAmount}
              code={code}
              useGrouping={useGrouping}
            />
            {/* <DuplicateAddress
                      selectedKeys={selectedKeys2}
                      setSelectedKeys={setSelectedKeys2}
                    /> */}
            <ShowSample
              example={
                native_coin_input_example[format as NFType].content ?? ''
              }
            />
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

      <Button
        onPress={async () => {
          console.log('continue');

          const worker = new Worker(
            new URL(
              '@/web-workers/input-nativecoins-validate.ts',
              import.meta.url,
            ),
            { type: 'module' },
          );
          const value = editorRef?.current?.getValue() ?? '';
          const input = {
            data: value,
            decimalSeparator,
            thousandSeparators: [thousandSeparator],
          };
          const result = await runWorker<typeof input, IReceipent[]>(
            worker,
            input,
          );

          setCheckValue(result);
        }}
      >
        Continue
      </Button>
      {checkValue.length > 0 && <CheckTable data={checkValue} />}
    </>
  );
};
