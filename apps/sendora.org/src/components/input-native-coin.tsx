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
import { useRef } from 'react';
import AddAmount from './add-amount';
import SNDRACodemirror, { type SNDRACodemirrorRef } from './codemirror-sndra';

export default ({ defaultValue = '' }) => {
  const { toggle, fullscreen } = useFullscreen();
  const { locale } = useLocale();
  const editorRef = useRef<SNDRACodemirrorRef | null>(null);
  return (
    <>
      <EditorRefContext.Provider value={editorRef}>
        <div className="w-full relative mb-12">
          <div className="flex w-full items-center justify-between mb-2">
            <H3Title>Recipients and amounts</H3Title>
            <UploadSpreadsheet />
          </div>

          <SNDRACodemirror
            ref={editorRef}
            defaultValue={defaultValue}
            onDocChange={() => console.log('onDocChange')}
            fullscreen={fullscreen}
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
      </EditorRefContext.Provider>
    </>
  );
};
