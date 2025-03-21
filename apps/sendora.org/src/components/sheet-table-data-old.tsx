import { useNativeCoinsValue } from '@/hooks/useNativeCoinsValue';
import { runWorker } from '@/libs/common';
import { getTableData } from '@/libs/common';
import type { TableData } from '@/libs/common';
import { Button, Card, CardBody, Tab, Tabs } from '@heroui/react';
import { Skeleton } from '@heroui/react';
import { useEffect, useState } from 'react';
import AnyTable from './any-table';
import UploadAction from './upload-action';
export default function SheetTableData({
  spreadsheetBuffer,
  sheetIndex,
  onClose,
}: {
  spreadsheetBuffer: ArrayBuffer;
  sheetIndex: number;
  onClose: () => void;
}) {
  const [tableData, setTableData] = useState<TableData | null>(null);

  const [recipientKey, setRecipientKey] = useState('');
  const [amountKey, setAmountKey] = useState('');

  useEffect(() => {
    return () => {
      setRecipientKey('');
      setAmountKey('');
    };
  }, []);

  useEffect(() => {
    setTableData(null);
    getTableData(spreadsheetBuffer, sheetIndex).then((result) => {
      setTableData(result);
    });
    return () => {
      setTableData(null);
    };
  }, [spreadsheetBuffer, sheetIndex]);
  const { setValue } = useNativeCoinsValue();

  const handleClick = async () => {
    const worker = new Worker(
      new URL('@/web-workers/tabledata-op1.ts', import.meta.url),
      { type: 'module' },
    );
    const input = {
      recipientKey,
      amountKey,
      tableData,
    };
    const result = await runWorker<typeof input, string>(worker, input);
    setValue(result);
    onClose();
  };
  return (
    <div className="flex w-full flex-col mb-4 pb-8 gap-2">
      {tableData == null && (
        <div className="space-y-3">
          <Skeleton className="w-3/5 rounded-lg" isLoaded={tableData != null}>
            <div className="h-3 w-full rounded-lg bg-secondary" />
          </Skeleton>
          <Skeleton className="w-4/5 rounded-lg" isLoaded={tableData != null}>
            <div className="h-3 w-full rounded-lg bg-secondary-300" />
          </Skeleton>
          <Skeleton className="w-2/5 rounded-lg" isLoaded={tableData != null}>
            <div className="h-3 w-full rounded-lg bg-secondary-200" />
          </Skeleton>
        </div>
      )}

      {tableData != null && (
        <UploadAction
          recipientKey={recipientKey}
          setRecipientKey={setRecipientKey}
          amountKey={amountKey}
          setAmountKey={setAmountKey}
          onClose={onClose}
          columns={[...tableData.columns]}
        />
      )}

      {recipientKey !== '' && (
        <div className="flex flex-wrap gap-4 items-center">
          <Button
            size="lg"
            fullWidth
            onPress={handleClick}
            className="bg-gradient-to-tr from-purple-600 to-fuchica-600 text-[#f7cf5294] shadow-lg"
          >
            Insert
          </Button>
        </div>
      )}
      {tableData != null && <AnyTable tableData={tableData} />}
    </div>
  );
}
