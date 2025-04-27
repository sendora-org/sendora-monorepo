import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
import { NumberInput, Switch } from '@heroui/react';
import { useState } from 'react';

import { EditorRefContext } from '@/constants/contexts';

import { numberFormats } from '@/constants/common';
import { useLocale } from '@/hooks/useLocale';
import { getRandomNumber, splitText } from '@/libs/common';
import { runWorker } from '@/libs/common';
import { formatBigIntNumber, parseAndScaleNumber } from '@/libs/number';
import { useContext } from 'react';

export default function AddAmount() {
  const editorRef = useContext(EditorRefContext);
  const { locale } = useLocale();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isRandom, setIsRandom] = useState(false);
  const [fixedValue, setFixedValue] = useState(0.0001);
  const [minValue, setMinValue] = useState(0.1);
  const [maxValue, setMaxValue] = useState(10);
  const [decimals, setDecimals] = useState(2);

  const [isLoading, setLoading] = useState(false);

  const { decimalSeparator, thousandSeparator } = numberFormats[locale];

  const handleClick = async (
    isRandom = false,
    fixedValue = 0.01,
    minValue = 0.01,
    maxValue = 10,
    decimals = 2,
  ) => {
    try {
      setLoading(true);
      const value = editorRef?.current?.getValue() ?? '';
      const setValue = editorRef?.current?.setValue;

      const worker = new Worker(
        new URL('@/workers/codemirror-amount-update.ts', import.meta.url),
        { type: 'module' },
      );
      const input = {
        raw: value,
        decimalSeparator,
        thousandSeparator,
        isRandom,
        fixedValue,
        minValue,
        maxValue,
        decimals,
      };
      const result = await runWorker<typeof input, string>(worker, input);

      setValue?.(result);
    } catch (e) {
      console.log('codemirror-amount-update=>', e);
    }

    setLoading(false);
  };

  return (
    <>
      <Button size="sm" onPress={onOpen}>
        Update Amount
      </Button>
      <Modal
        disableAnimation
        isDismissable={false}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        shouldBlockScroll={false}
        classNames={{ wrapper: 'items-start h-auto', base: 'my-auto' }}
        size="md"
      >
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Update Amount
              </ModalHeader>
              <ModalBody>
                <Switch isSelected={isRandom} onValueChange={setIsRandom}>
                  {isRandom ? 'Random Amount' : 'Fixed Amount'}
                </Switch>

                {!isRandom && (
                  <NumberInput
                    hideStepper
                    inputMode="decimal"
                    formatOptions={{
                      useGrouping: true,
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 20,
                    }}
                    fullWidth
                    isRequired
                    classNames={{
                      input: 'text-base',
                    }}
                    minValue={0}
                    value={fixedValue}
                    onChange={(v) => {}}
                    onValueChange={(v) => {
                      setFixedValue(v);
                    }}
                    label="Fixed Amount"
                    placeholder="Enter the amount"
                  />
                )}

                {isRandom && (
                  <div className="flex flex-col gap-2">
                    <NumberInput
                      hideStepper
                      formatOptions={{
                        useGrouping: true,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 20,
                      }}
                      inputMode="decimal"
                      fullWidth
                      isRequired
                      classNames={{
                        input: 'text-base ',
                      }}
                      minValue={0}
                      value={minValue}
                      onValueChange={setMinValue}
                      label="Min Amount"
                      placeholder="Enter the min amount"
                    />
                    <NumberInput
                      hideStepper
                      inputMode="decimal"
                      formatOptions={{
                        useGrouping: true,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 20,
                      }}
                      fullWidth
                      isRequired
                      classNames={{
                        input: 'text-base  ',
                      }}
                      minValue={0}
                      value={maxValue}
                      onValueChange={setMaxValue}
                      label="Max Amount"
                      placeholder="Enter the max amount"
                    />
                    <NumberInput
                      hideStepper
                      inputMode="numeric"
                      pattern="[0-9]*"
                      formatOptions={{
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }}
                      fullWidth
                      isRequired
                      classNames={{
                        input: 'text-base  ',
                      }}
                      minValue={0}
                      maxValue={6}
                      value={decimals}
                      onValueChange={setDecimals}
                      label="Decimals"
                      placeholder="Enter the Decimals"
                    />
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  isLoading={isLoading}
                  color="primary"
                  onPress={async () => {
                    await handleClick(
                      isRandom,
                      fixedValue,
                      minValue,
                      maxValue,
                      decimals,
                    );
                    onClose();
                    // @ts-ignore
                    window?.stonks?.event('update-amount', { isRandom });
                  }}
                >
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
