'use client';
import { CallBuilderProvider } from '@/providers/callBuilder-provider';
import { Tab, Tabs } from '@heroui/react';
import React from 'react';
import type { Chain } from 'viem';
import { Arbitrage } from './arbitrage';
import { MultiStep } from './multi-step';
import { TransactionBuilder } from './transaction-builder';
import { WrapTransactionBuilder } from './transaction-builder';
type IProps = {
  network: Chain;
};

const tabsData = [
  {
    key: '0',
    label: 'Transaction Builder',
    Component: WrapTransactionBuilder,
  },

  // {
  //   key: '1',
  //   label: 'Multi Step',
  //   Component: MultiStep,
  // },

  // {
  //   key: '2',
  //   label: 'Arbitrage',
  //   Component: Arbitrage,
  // },
];
// const MemoizedComponents = tabsData.map((tab) => {
//   const WrappedComponent = ({ network }: IProps) => (
//     <CallBuilderProvider>
//       <tab.Component network={network} />
//     </CallBuilderProvider>
//   );
//   return React.memo(WrappedComponent);
// });

const MemoizedComponents = tabsData.map((tab) => {
  return React.memo(tab.Component);
});

export const App = ({ network }: IProps) => {
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
