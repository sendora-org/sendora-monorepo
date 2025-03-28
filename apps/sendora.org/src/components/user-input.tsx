'use client';
import DecimalSeparatorSwitch from '@/components/decimal-separator-switch';
import H3Title from '@/components/h3-title';
import ShowSample from '@/components/show-sample';
import UploadSpreadsheet from '@/components/upload-spreadsheet';

import type { IExample } from '@/constants/common';
import { useLocale } from '@/hooks/useLocale';
import { Button, ButtonGroup } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useFullscreen } from '@mantine/hooks';
import { memo, useCallback, useState } from 'react';
import { Subject } from 'rxjs';
import AddAmount from './add-amount';
import SNDRACodemirror from './codemirror-sndra';
import { ConfirmInput } from './confirm-input';

import { forwardRef } from 'react';
const SNDRACodemirrorMemo = memo(SNDRACodemirror);
const eventSubject = new Subject<{ event: string }>();
export default forwardRef(
  (
    { defaultValue = '', example }: { defaultValue: string; example: IExample },
    ref,
  ) => {
    console.log(`user input render ${new Date().toISOString()}`);
    const { toggle, fullscreen } = useFullscreen();
    const { locale } = useLocale();

    const onDocChange = useCallback(() => {
      console.log('onDocChange');
      eventSubject.next({ event: 'onDocChange' });
    }, []);

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
        <ConfirmInput eventSubject={eventSubject} />
      </>
    );
  },
);
