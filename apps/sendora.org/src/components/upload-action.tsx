import type { Column, Row } from '@/libs/common';
import { runWorker } from '@/libs/common';
import { Button, Select, SelectItem } from '@heroui/react';
import { useEffect, useState } from 'react';

export default function UploadAction({
  columns,
  recipientKey,
  setRecipientKey,
  amountKey,
  setAmountKey,
  onClose,
}: {
  columns: Column[];
  onClose: () => void;
  recipientKey: string;
  amountKey: string;
  setRecipientKey: (v: string) => void;
  setAmountKey: (v: string) => void;
}) {
  return (
    <div className="flex sm:flex-row flex-col gap-2">
      <Select
        isRequired
        className="md:w-[50%]"
        label="Recipient Column"
        placeholder="Select an column"
        selectedKeys={new Set([recipientKey])}
        variant="bordered"
        onSelectionChange={(v) => {
          setRecipientKey(Array.from(v).join(''));
        }}
      >
        {columns.map((column) => (
          <SelectItem key={column.key}>{column.label}</SelectItem>
        ))}
      </Select>

      <Select
        className="md:w-[50%]"
        label="Amount Column"
        placeholder="Select an column"
        selectedKeys={new Set([amountKey])}
        variant="bordered"
        onSelectionChange={(v) => {
          setAmountKey(Array.from(v).join(''));
        }}
      >
        {columns.map((column) => (
          <SelectItem key={column.key}>{column.label}</SelectItem>
        ))}
      </Select>
    </div>
  );
}
