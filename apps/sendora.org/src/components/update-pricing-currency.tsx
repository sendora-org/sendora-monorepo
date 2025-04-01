import { useCurrencyStore } from '@/hooks/useCurrencyStore';
import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  NumberInput,
} from '@heroui/react';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
import { Radio, RadioGroup } from '@heroui/react';

// @ts-ignore
import union from 'lodash/union';
import React, { useState } from 'react';
import { ChevronDownIcon } from './chevron-down-icon';

export default function App() {
  const { codes, addCode, selectedCode, setCode, removeCode, clearCodes } =
    useCurrencyStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const builtinsCurrencies = [
    'USD',
    'EUR',
    'JPY',
    'GBP',
    'CNY',
    'RUB',
    'KRW',
    'CAD',
    'SGD',
    'HKD',
    'CHF',
  ];

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

      <Button isIconOnly className="text-default-400 " onPress={onOpen}>
        <ChevronDownIcon />
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        className="max-h-[500px]"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <RadioGroup
                  label="Select your currency"
                  value={selectedCode}
                  onValueChange={setCode}
                >
                  {union(builtinsCurrencies, codes).map((key: string) => {
                    return (
                      <Radio className="max-w-[100%]" key={key} value={key}>
                        {key}
                      </Radio>
                    );
                  })}
                </RadioGroup>
              </ModalBody>

              <ModalFooter>
                <Input
                  classNames={{
                    input: 'uppercase text-base',
                  }}
                  value={input}
                  onValueChange={setInput}
                  variant="bordered"
                  label=""
                  labelPlacement="outside"
                  placeholder="your currency"
                />
                <Button
                  onPress={handleAdd}
                  className="rounded-lg"
                  variant="solid"
                >
                  Add
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* <Dropdown
        placement="bottom-end"
        className="bg-default-100 text-default-400 data-[hover=true]:bg-default-100"
      >
        <DropdownTrigger>
          <Button isIconOnly className="text-default-400 ">
            <ChevronDownIcon />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          classNames={{ base: 'overflow-y-auto max-h-[300px]' }}
          bottomContent={
            <div className="flex flex-col gap-2">



           
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
     
        </DropdownMenu>
      </Dropdown> */}
    </ButtonGroup>
  );
}
