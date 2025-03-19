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
        {/* // USA  1,234,567.89
            // South Korea 1234567.89
            // Germany 1.234.567,89
            // France  1 234 567,89
            // Switzerland 1'234'567,89 
        */}
        <DropdownItem key="USA">USA : 1,234,567.89</DropdownItem>
        <DropdownItem key="DE">Germany: 1.234.567,89</DropdownItem>
        <DropdownItem key="FR">France: 1 234 567,89</DropdownItem>
        <DropdownItem key="CH">Switzerland: 1'234'567,89 </DropdownItem>
        <DropdownItem key="DOT">Dot: 1234567.89</DropdownItem>
        <DropdownItem key="COMMA">Comma: 1234567,89</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
