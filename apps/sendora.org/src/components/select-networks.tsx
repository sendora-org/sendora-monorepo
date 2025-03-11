import { type NetworkInfo, networks } from '@/constants/config';
import { Avatar, Select, SelectItem, type SelectProps } from '@heroui/react';
import { clsx } from 'clsx';
import type {
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  ReactPortal,
} from 'react';

export default function SelectNetworks({
  classes = '',
  defaultSelectedKeys = ['1'],
  navigate = (e: string) => {
    console.log(e);
  },
}) {
  return (
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
        base: clsx('max-w-xs', classes),
        trigger: 'h-8',
      }}
      items={networks}
      labelPlacement="outside"
      placeholder="Select a network"
      // @ts-ignore
      renderValue={(
        items: { key: string | number | undefined; data: NetworkInfo }[],
      ) => {
        return items.map(
          (item: { key: string | number | undefined; data: NetworkInfo }) => (
            <div key={item.key} className="flex items-center gap-2">
              <Avatar
                alt={item.data.name}
                className="w-4 h-4 text-tiny sm:w-6 sm:h-6 flex-shrink-0"
                src={item.data.avatar}
              />
              <div className="flex flex-col  ">
                <span className="text-default-600">{item.data.name} </span>
              </div>
            </div>
          ),
        );
      }}
    >
      {(network: {
        chainId: number;
        name: string;
        avatar: string;
      }) => (
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
      )}
    </Select>
  );
}
