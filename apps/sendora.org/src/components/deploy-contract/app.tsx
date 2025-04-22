'use client';
import ConnectedAccount from '@/components/connected-account';
import StepProgress from '@/components/step-progress';
import { useStep } from '@/hooks/useStep';
import type { Step } from '@/hooks/useStep';
import React, { useRef } from 'react';
import type { Chain } from 'viem';

import UserInput from '@/components/user-input';
import { native_coin_input_example } from '@/constants/common';
import { EditorRefContext } from '@/constants/contexts';
import { Input, Tab, Tabs, Textarea } from '@heroui/react';
import { useEffect } from 'react';

import { Button, Tooltip } from '@heroui/react';
import { cn } from '@heroui/react';
import { Icon } from '@iconify/react';
import { CopyText } from '../copy-text-2';

import TextareaInput from '@/components/textarea-input';
import H3Title from '../h3-title';
import { SetGasPrice } from '../set-gas-price';
import { Create2 } from './create2';
import { RawTransaction } from './raw-transaction';
import { Standard } from './standard';

type Iprops = {
  network: Chain;
};

const tabsData = [
  {
    key: '0',
    label: 'Create2',
    Component: Create2,
  },

  {
    key: '1',
    label: 'Standard',
    Component: Standard,
  },

  {
    key: '2',
    label: 'Raw Transaction',
    Component: RawTransaction,
  },
];
const MemoizedComponents = tabsData.map((tab) => React.memo(tab.Component));

export const App = ({ network }: Iprops) => {
  console.log(`deploy contract render ${new Date().toISOString()}`);

  const [selected, setSelected] = React.useState('0');

  const Comp = MemoizedComponents[Number(selected)];
  return (
    <div className="flex flex-col gap-2 w-full">
      <Tabs
        aria-label="Tabs radius"
        radius={'sm'}
        selectedKey={selected}
        onSelectionChange={setSelected}
      >
        {tabsData.map((tab) => (
          <Tab key={tab.key} title={tab.label} />
        ))}
      </Tabs>

      <Comp network={network} />
    </div>
  );
};
