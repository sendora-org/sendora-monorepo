'use client';
import DecimalSeparatorSwitch from '@/components/decimal-separator-switch';
import H3Title from '@/components/h3-title';
import ShowSample from '@/components/show-sample';
import { vscodeDark } from '@/libs/vscodeDark';
import { Button, ButtonGroup } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useFullscreen } from '@mantine/hooks';
import CodeMirror from '@uiw/react-codemirror';
import { useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { native_coin_input_example } from '@/constants/common';

export default () => {
  const { ref, toggle, fullscreen } = useFullscreen();
  const [value, setValue] = useState('');
  const matches = useMediaQuery('(min-width: 768px)');
  const onChange = (val: string) => {
    setValue(val);
  };
  const [selectedKeys, setSelectedKeys] = useState(new Set(['USA']));
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
