'use client';
import { type NetworkInfo, networks } from '@/constants/config';
import {
  Avatar,
  Button,
  Select,
  SelectItem,
  SelectSection,
} from '@heroui/react';
import { clsx } from 'clsx';
import ChangeRPCModal from './change-rpc-modal';

export default function SelectNetworks({
  classes = '',
  defaultSelectedKeys = ['1'],
  navigate = (chainId: string) => {
    console.log(chainId);
  },
}) {
  // const pinned = networks.filter((network) => { return !network.isTestnet && network.isPopular })
  const mainnets = networks.filter((network) => {
    return !network.isTestnet && network.isPopular;
  });
  const testnets = networks.filter((network) => {
    return network.isTestnet;
  });
  return (
    <div className="flex items-center flex-1 justify-end gap-2">
      <Select
        disallowEmptySelection
        aria-label="Select networks"
        onChange={(e: { target: { value: string } }) => {
          if (e.target.value) {
            navigate(e.target.value);
          }
        }}
        defaultSelectedKeys={defaultSelectedKeys}
        size="sm"
        classNames={{
          base: clsx('max-w-xs flex-1', classes),
          trigger: 'h-8',
        }}
        // items={networks}
        labelPlacement="outside"
        placeholder="Select a network"
        // @ts-ignore
        renderValue={(
          items: { key: string | number | undefined; data: NetworkInfo }[],
        ) => {
          console.log(items);
          return items.map(
            (item: { key: string | number | undefined; data: NetworkInfo }) => (
              <div key={item.key} className="flex items-center gap-2">
                <Avatar
                  alt={item?.data?.name}
                  className="w-4 h-4 text-tiny sm:w-6 sm:h-6 flex-shrink-0"
                  src={item?.data?.avatar}
                />
                <div className="flex flex-col  ">
                  <span className="text-default-600">{item?.data?.name} </span>
                </div>
              </div>
            ),
          );
        }}
      >
        <SelectSection showDivider title="Popular" items={mainnets}>
          {(network) => {
            if (!network.isTestnet) {
              return (
                <SelectItem
                  aria-label="@sendora"
                  key={network.chainId}
                  textValue={network.name as string}
                >
                  <div className="flex gap-2 items-center">
                    <Avatar
                      alt={network.name as string}
                      className="w-4 h-4 text-tiny sm:w-6 sm:h-6 flex-shrink-0"
                      src={network.avatar}
                    />
                    <div className="flex flex-col">
                      <span className="text-small">{network.name}</span>
                    </div>
                  </div>
                </SelectItem>
              );
            }
            return null;
          }}
        </SelectSection>
        <SelectSection showDivider title="Testnest" items={testnets}>
          {(network) => {
            if (network.isTestnet) {
              return (
                <SelectItem
                  aria-label="@sendora"
                  key={network.chainId}
                  textValue={network.name as string}
                >
                  <div className="flex gap-2 items-center">
                    <Avatar
                      alt={network.name as string}
                      className="w-4 h-4 text-tiny sm:w-6 sm:h-6 flex-shrink-0"
                      src={network.avatar}
                    />
                    <div className="flex flex-col">
                      <span className="text-small">{network.name}</span>
                    </div>
                  </div>
                </SelectItem>
              );
            }
            return null;
            // return <SelectItem aria-label="@sendora" key={network.chainId} textValue={ } />;
          }}
        </SelectSection>
      </Select>
      <ChangeRPCModal chainId={defaultSelectedKeys.join('')} />
    </div>
  );
}
