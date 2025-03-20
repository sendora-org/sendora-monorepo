import { useNativeCoinsValue } from '@/hooks/useNativeCoinsValue';
import type { Column, Row } from '@/libs/common';
import { Button, Select, SelectItem } from '@heroui/react';
import { useState } from 'react';

export default function UploadAction({
  tableData,
  onClose,
}: {
  tableData: {
    columns: Column[];
    rows: Row[];
  };
  onClose: () => void;
}) {
  const [recipientKey, setRecipientKey] = useState('');
  const [amountKey, setAmountKey] = useState('');
  const { setValue } = useNativeCoinsValue();
  return (
    <div className="flex sm:flex-row flex-col gap-2">
      <Select
        className="w-full"
        label="Recipient Column"
        placeholder="Select an column"
        selectedKeys={new Set([recipientKey])}
        variant="bordered"
        onSelectionChange={(v) => {
          setRecipientKey(Array.from(v).join(''));
        }}
      >
        {tableData.columns.map((column) => (
          <SelectItem key={column.key}>{column.label}</SelectItem>
        ))}
      </Select>

      <Select
        className="w-full"
        label="Amount Column"
        placeholder="Select an column"
        selectedKeys={new Set([amountKey])}
        variant="bordered"
        onSelectionChange={(v) => {
          setAmountKey(Array.from(v).join(''));
        }}
      >
        {tableData.columns.map((column) => (
          <SelectItem key={column.key}>{column.label}</SelectItem>
        ))}
      </Select>

      {recipientKey !== '' && (
        <div className="flex flex-wrap gap-4 items-center">
          <Button
            size="lg"
            fullWidth
            onPress={() => {
              const data = tableData.rows
                .map((row) => {
                  return `${row[recipientKey] ?? ''},${row[amountKey] ?? ''}`;
                })
                .join('\n');
              console.log(data);
              setValue(data);
              onClose();

              // if (value2.size > 0) {
              //   const to = value.values().next().value!;
              //   const amount = value2.values().next().value!;
              //   console.log({ to, amount });

              // } else {
              //   const to = value.values().next().value!;
              //   const data = tableData.rows
              //     .map((row) => {
              //       return `${row[to] ?? ''}`;
              //     })
              //     .join('\n');
              //   console.log(data);
              //   updateCM(data);
              //   onClose();
              // }
            }}
            className="bg-gradient-to-tr from-purple-600 to-fuchica-600 text-[#f7cf5294] shadow-lg"
          >
            Insert to editor
          </Button>
        </div>
      )}
    </div>
  );
}
