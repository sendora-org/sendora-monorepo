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

  const { decimalSeparator, thousandSeparator } = numberFormats[locale];

  const updateAmount = (
    isRandom = false,
    fixedValue = 0.01,
    minValue = 0.01,
    maxValue = 10,
    decimals = 2,
  ) => {
    const value = editorRef?.current?.getValue() ?? '';
    const setValue = editorRef?.current?.setValue;

    if (!isRandom) {
      setValue?.(
        value
          .split('\n')
          .map((item) => {
            return `${splitText(item)[0]},${formatBigIntNumber(parseAndScaleNumber(fixedValue.toString(), ',', '.'), thousandSeparator, decimalSeparator)}`;
          })
          .join('\n'),
      );
    } else {
      setValue?.(
        value
          .split('\n')
          .map((item) => {
            return `${splitText(item)[0]},${formatBigIntNumber(parseAndScaleNumber(getRandomNumber(minValue, maxValue, decimals), ',', '.'), thousandSeparator, decimalSeparator)}`;
          })
          .join('\n'),
      );
    }
  };

  return (
    <>
      <Button size="sm" onPress={onOpen}>
        Update Amount
      </Button>
      <Modal
      isDismissable={false}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="auto"
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
                    formatOptions={{
                      useGrouping: true,
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 20,
                    }}
                    fullWidth
                    isRequired
                   classNames={{
                    input: "text-base" 
                   }} 
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
                      formatOptions={{
                        useGrouping: true,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 20,
                      }}
                      fullWidth
                      isRequired
                      classNames={{
                        input: "text-base" 
                       }} 
                      value={minValue}
                      onValueChange={setMinValue}
                      label="Min Amount"
                      placeholder="Enter the amount"
                    />
                    <NumberInput
                      formatOptions={{
                        useGrouping: true,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 20,
                      }}
                      fullWidth
                      isRequired
                      classNames={{
                        input: "text-base" 
                       }} 
                      value={maxValue}
                      onValueChange={setMaxValue}
                      label="Max Amount"
                      placeholder="Enter the amount"
                    />
                    <NumberInput
                      formatOptions={{
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }}
                      fullWidth
                      isRequired
                      classNames={{
                        input: "text-base" 
                       }} 
                      value={decimals}
                      min={0}
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
                  color="primary"
                  onPress={() => {
                    updateAmount(
                      isRandom,
                      fixedValue,
                      minValue,
                      maxValue,
                      decimals,
                    );
                    onClose();
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
