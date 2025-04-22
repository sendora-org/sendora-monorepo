'use client';

import { Tab, Tabs } from '@heroui/react';
import React from 'react';
import type { Chain } from 'viem';
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
        onSelectionChange={(v) => {
          setSelected(String(v));
        }}
      >
        {tabsData.map((tab) => (
          <Tab key={tab.key} title={tab.label} />
        ))}
      </Tabs>

      <Comp network={network} />
    </div>
  );
};
