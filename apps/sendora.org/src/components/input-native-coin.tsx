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
const example = `0x1345fc0db80b4e3d872a3770ddab52ef16f2bf17,0.001
0x4395780d9062D76c618c7C62659Cc31F0d20214e,0.002
999.arb,0.003
123456.bnb,0.004
vitalik.eth,0.005
sendora.base.eth,0.006`;

export default () => {
  const { ref, toggle, fullscreen } = useFullscreen();
  const [value, setValue] = useState('');
  const matches = useMediaQuery('(min-width: 768px)');
  const onChange = (val: string) => {
    setValue(val);
  };
  const [selectedKeys, setSelectedKeys] = useState(new Set(['dot']));
  return (
    <div className="w-full relative">
      <div className="flex w-full items-center justify-between mb-2">
        <H3Title>Recipients and amounts</H3Title>
        <ShowSample example={example} />
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
