import { runWorker } from '@/libs/common';
import { getWorkbook } from '@/libs/common';
import { Card, CardBody, Tab, Tabs } from '@heroui/react';
import { Skeleton } from '@heroui/react';
import { useEffect, useState } from 'react';
import SheetTableData from './sheet-table-data';

export default function SheetTabs({
  spreadsheetBuffer,
  onClose,
}: { spreadsheetBuffer: ArrayBuffer; onClose: () => void }) {
  const [sheetNames, setSheetNames] = useState<string[] | null>(null);
  const [selected, setSelected] = useState('0');

  console.log('SheetTabs');
  useEffect(() => {
    // console.log({ spreadsheetBuffer });
    setSheetNames(null);
    getWorkbook(spreadsheetBuffer).then((result) => {
      setSheetNames(result);
    });
  }, [spreadsheetBuffer]);
  return (
    <div className="flex w-full flex-col gap-2">
      {sheetNames == null && (
        <div className="space-y-3">
          <Skeleton className="w-3/5 rounded-lg" isLoaded={sheetNames != null}>
            <div className="h-3 w-full rounded-lg bg-secondary" />
          </Skeleton>
          <Skeleton className="w-4/5 rounded-lg" isLoaded={sheetNames != null}>
            <div className="h-3 w-full rounded-lg bg-secondary-300" />
          </Skeleton>
          <Skeleton className="w-2/5 rounded-lg" isLoaded={sheetNames != null}>
            <div className="h-3 w-full rounded-lg bg-secondary-200" />
          </Skeleton>
        </div>
      )}

      {sheetNames != null && (
        <Tabs
          aria-label="sheets"
          selectedKey={selected}
          onSelectionChange={(v) => {
            setSelected(String(v));
          }}
        >
          {sheetNames.map((name: string, index: number) => (
            <Tab key={String(index)} title={name} />
          ))}
        </Tabs>
      )}
      <SheetTableData
        onClose={onClose}
        sheetIndex={Number(selected)}
        spreadsheetBuffer={spreadsheetBuffer}
      />
    </div>
  );
}
