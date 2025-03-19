import type { NFValue } from '@/constants/common';
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

export default function AddAmount({
  updateAmount,
  code,
  useGrouping,
}: {
  updateAmount: (
    isRandom: boolean,
    fixedValue: number,
    minValue: number,
    maxValue: number,
    decimals: number,
  ) => void;
  useGrouping: boolean;
  code: NFValue['code'];
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [isRandom, setIsRandom] = useState(false);
  const [fixedValue, setFixedValue] = useState(0.0001);
  const [minValue, setMinValue] = useState(0.1);
  const [maxValue, setMaxValue] = useState(10);
  const [decimals, setDecimals] = useState(2);

  return (
    <>
      <Button size="sm" onPress={onOpen}>
        Add Amount
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        size="lg"
      >
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add Amount
              </ModalHeader>
              <ModalBody>
                <Switch isSelected={isRandom} onValueChange={setIsRandom}>
                  {isRandom ? 'Random Amount' : 'Fixed Amount'}
                </Switch>

                {!isRandom && (
                  <NumberInput
                    formatOptions={{
                      useGrouping: useGrouping,
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 20,
                    }}
                    fullWidth
                    isRequired
                    className=" "
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
                        useGrouping: useGrouping,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 20,
                      }}
                      fullWidth
                      isRequired
                      className=" "
                      value={minValue}
                      onValueChange={setMinValue}
                      label="Min Amount"
                      placeholder="Enter the amount"
                    />
                    <NumberInput
                      formatOptions={{
                        useGrouping: useGrouping,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 20,
                      }}
                      fullWidth
                      isRequired
                      className=" "
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
                      className=" "
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
