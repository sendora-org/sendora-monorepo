'use client';
import DecimalSeparatorSwitch from '@/components/decimal-separator-switch';
import H3Title from '@/components/h3-title';
import ShowSample from '@/components/show-sample';
import { native_coin_input_example } from '@/constants/common';
import { type NFType, numberFormats } from '@/constants/common';
import { getRandomNumber } from '@/libs/common';
import { splitText } from '@/libs/common';
import {
  formatLocalizedNumberWithSmallNumbers,
  getDecimalsScientific,
} from '@/libs/common';
import { parseLocalizedNumber } from '@/libs/common';
import { vscodeDark } from '@/libs/vscodeDark';
import { Button, ButtonGroup } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useFullscreen } from '@mantine/hooks';
import CodeMirror from '@uiw/react-codemirror';
import { useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import AddAmount from './add-amount';
export default () => {
  const { ref, toggle, fullscreen } = useFullscreen();
  const [value, setValue] = useState('');
  const matches = useMediaQuery('(min-width: 768px)');
  const onChange = (val: string) => {
    setValue(val);
  };

  const [selectedKeys, setSelectedKeys] = useState(new Set(['USA']));

  const format = Array.from(selectedKeys).join('');
  const { decimalSeparator, thousandSeparator, code, useGrouping } =
    numberFormats[format as NFType];

  const updateAmount = (
    isRandom = false,
    fixedValue = 0.01,
    minValue = 0.01,
    maxValue = 10,
    decimals = 2,
  ) => {
    if (!isRandom) {
      const decimals2 = getDecimalsScientific(fixedValue);
      console.log({ decimals2 });
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
    <div className="w-full relative mb-12">
      <div className="flex w-full items-center justify-between mb-2">
        <H3Title>Recipients and amounts</H3Title>
      </div>

      <div ref={ref}>
        <CodeMirror
          value={value}
          height={fullscreen ? '100vh' : matches ? '450px' : '300px'}
          onChange={onChange}
          theme={vscodeDark}
        />
      </div>

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
          <ShowSample tabs={native_coin_input_example} />
          <DecimalSeparatorSwitch
            selectedKeys={selectedKeys}
            setSelectedKeys={setSelectedKeys}
          />
          {/* <UploadExcel updateCM={setValue} /> */}

          {/* {UploadExcel({ updateCM: setValue })} */}
          <Button isIconOnly size="sm" onPress={toggle}>
            <Icon
              icon="qlementine-icons:fullscreen-16"
              width="16"
              height="16"
            />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};
