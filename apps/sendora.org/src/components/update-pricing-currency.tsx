import { useCurrencyStore } from '@/hooks/useCurrencyStore';
import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
} from '@heroui/react';
// @ts-ignore
import union from 'lodash/union';
import React, { useState } from 'react';
import { ChevronDownIcon } from './chevron-down-icon';

export default function App() {
  const { codes, addCode, selectedCode, setCode, removeCode, clearCodes } =
    useCurrencyStore();

  const builtinsCurrencies = ['USD', 'EUR', 'JPY', 'GBP', 'CNY', 'RUB'];

  const [input, setInput] = useState('');

  console.log({ selectedCode });
  const handleAdd = () => {
    if (input.trim()) {
      const currency = input.trim().toUpperCase();
      addCode(currency);

      console.log({ currency });
      setCode(currency);
      setInput('');
    }
  };

  return (
    // d
    <ButtonGroup variant="light">
      <div className=" text-default-400  ">{selectedCode}</div>
      <Dropdown
        placement="bottom-end"
        className="bg-default-100 text-default-400 data-[hover=true]:bg-default-100"
      >
        <DropdownTrigger>
          <Button isIconOnly className="text-default-400 ">
            <ChevronDownIcon />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          bottomContent={
            <div className="flex flex-col gap-2">
              {' '}
              <Input
                classNames={{
                  input: 'uppercase',
                }}
                value={input}
                onValueChange={setInput}
                variant="bordered"
                label=""
                labelPlacement="outside"
                placeholder="your currency"
                type="tet"
              />
              <Button
                onPress={handleAdd}
                className="rounded-lg"
                variant="solid"
              >
                Add
              </Button>
            </div>
          }
          disallowEmptySelection
          aria-label="Merge options"
          className="max-w-[300px]"
          selectedKeys={new Set([selectedCode])}
          selectionMode="single"
          onSelectionChange={(v) => {
            setCode(Array.from(v).join(''));
          }}
        >
          {union(builtinsCurrencies, codes).map((key: string) => {
            return <DropdownItem key={key}>{key}</DropdownItem>;
          })}
        </DropdownMenu>
      </Dropdown>
    </ButtonGroup>
  );
}
