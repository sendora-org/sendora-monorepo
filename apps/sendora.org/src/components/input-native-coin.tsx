'use client';
import DecimalSeparatorSwitch from '@/components/decimal-separator-switch';
import H3Title from '@/components/h3-title';
import ShowSample from '@/components/show-sample';
import UploadSpreadsheet from '@/components/upload-spreadsheet';
import { native_coin_input_example } from '@/constants/common';
import { EditorRefContext } from '@/constants/contexts';
import { useLocale } from '@/hooks/useLocale';
import { Button, ButtonGroup } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useFullscreen } from '@mantine/hooks';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import AddAmount from './add-amount';
import SNDRACodemirror, { type SNDRACodemirrorRef } from './codemirror-sndra';
import { ConfirmInput } from './confirm-input';

import { forwardRef } from 'react';
const SNDRACodemirrorMemo = memo(SNDRACodemirror);

export default forwardRef(
  ({ defaultValue = '' }: { defaultValue: string }, ref) => {
    const { toggle, fullscreen } = useFullscreen();
    const { locale } = useLocale();

    const onDocChange = useCallback(() => {
      console.log('onDocChange');
    }, []);

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    return (
      <>
        <label>
          Name{': '}
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Address{': '}
          <input value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>

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

              <ShowSample
                example={native_coin_input_example[locale].content ?? ''}
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
        <ConfirmInput />
      </>
    );
  },
);
