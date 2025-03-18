import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';
import type { SharedSelection } from '@heroui/react';
import React from 'react';

export default function App({
  selectedKeys,
  setSelectedKeys,
}: {
  selectedKeys: Set<string>;
  setSelectedKeys: (value: Set<string>) => void;
}) {
  // const [] = React.useState(new Set(["dot"]));

  const selectedValue = React.useMemo(
    () => Array.from(selectedKeys).join(', ').replace(/_/g, ''),
    [selectedKeys],
  );

  console.log(selectedKeys, selectedKeys.values().next().value);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button className="capitalize" size="sm">
          {selectedValue}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        aria-label="Single selection example"
        selectedKeys={selectedKeys}
        selectionMode="single"
        variant="flat"
        onSelectionChange={(value: SharedSelection) => {
          setSelectedKeys(value as Set<string>);
        }}
      >
        <DropdownItem key="dot">Dot format : 1,234,567.89</DropdownItem>
        <DropdownItem key="comma">Comma format : 1.234.567,89</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
