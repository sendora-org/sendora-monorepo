import { type NFType, numberFormats } from '@/constants/common';
import { local2NumberFormat } from '@/constants/common';
import { useLocale } from '@/hooks/useLocale';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';
import type { SharedSelection } from '@heroui/react';
import React from 'react';
export default function App() {
  const { setLocale, locale } = useLocale();

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button className="capitalize" size="sm">
          {local2NumberFormat[locale]}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        aria-label="Single selection example"
        selectedKeys={new Set([local2NumberFormat[locale]])}
        selectionMode="single"
        variant="flat"
        onSelectionChange={(value: SharedSelection) => {
          const format = Array.from(value).join('');
          const { decimalSeparator, thousandSeparator, code, useGrouping } =
            numberFormats[format as NFType];
          setLocale(code);
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
        <DropdownItem key="CH">Switzerland: 1'234'567.89 </DropdownItem>
        {/* <DropdownItem key="DOT">Dot: 1234567.89</DropdownItem>
        <DropdownItem key="COMMA">Comma: 1234567,89</DropdownItem> */}
      </DropdownMenu>
    </Dropdown>
  );
}
