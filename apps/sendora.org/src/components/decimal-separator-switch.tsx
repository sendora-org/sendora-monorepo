import type { Locale } from '@/constants/common';
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
          {locale}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        aria-label="Single selection example"
        selectedKeys={new Set([locale])}
        selectionMode="single"
        variant="flat"
        onSelectionChange={(value: SharedSelection) => {
          const selectedLocale = Array.from(value).join('') as Locale;
          setLocale(selectedLocale);
        }}
      >
        <DropdownItem key="en-US">en-US : 1,234,567.89</DropdownItem>
        <DropdownItem key="de-DE">de-DE: 1.234.567,89</DropdownItem>
        <DropdownItem key="fr-FR">fr-FR: 1 234 567,89</DropdownItem>
        <DropdownItem key="de-CH">de-CH: 1'234'567.89 </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
