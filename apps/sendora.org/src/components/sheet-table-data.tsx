import { runWorker } from '@/libs/common';
import { getTableData } from '@/libs/common';
import type { TableData } from '@/libs/common';
import { Card, CardBody, Tab, Tabs } from '@heroui/react';
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
  useEffect(() => {
    setTableData(null);
    getTableData(spreadsheetBuffer, sheetIndex).then((result) => {
      setTableData(result);
    });
  }, [spreadsheetBuffer, sheetIndex]);

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
        <UploadAction onClose={onClose} tableData={tableData} />
      )}
      {tableData != null && <AnyTable tableData={tableData} />}
    </div>
  );
}
