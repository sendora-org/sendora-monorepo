import { EditorRefContext } from '@/constants/contexts';
import { runWorker } from '@/libs/common';
import { getTableData } from '@/libs/common';
import type { TableData } from '@/libs/common';
import { Button, Skeleton } from '@heroui/react';
import { useContext, useEffect, useRef, useState } from 'react';
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
  const tableDataRef = useRef<TableData | null>(null);
  const [, forceUpdate] = useState({});

  const [recipientKey, setRecipientKey] = useState('');
  const [amountKey, setAmountKey] = useState('');

  const editorRef = useContext(EditorRefContext);

  useEffect(() => {
    return () => {
      setRecipientKey('');
      setAmountKey('');
    };
  }, []);

  useEffect(() => {
    tableDataRef.current = null;
    getTableData(spreadsheetBuffer, sheetIndex).then((result) => {
      tableDataRef.current = result;
      forceUpdate({});
    });
    return () => {
      tableDataRef.current = null;
    };
  }, [spreadsheetBuffer, sheetIndex]);

  const handleClick = async () => {
    const worker = new Worker(
      new URL('@/web-workers/tabledata-op1.ts', import.meta.url),
      { type: 'module' },
    );
    const input = {
      recipientKey,
      amountKey,
      tableData: tableDataRef.current,
    };
    const result = await runWorker<typeof input, string>(worker, input);

    editorRef?.current?.setValue(result);

    onClose();
  };
  return (
    <div className="flex w-full flex-col mb-4 pb-8 gap-2">
      {tableDataRef.current == null && (
        <div className="space-y-3">
          <Skeleton
            className="w-3/5 rounded-lg"
            isLoaded={tableDataRef.current != null}
          >
            <div className="h-3 w-full rounded-lg bg-secondary" />
          </Skeleton>
          <Skeleton
            className="w-4/5 rounded-lg"
            isLoaded={tableDataRef.current != null}
          >
            <div className="h-3 w-full rounded-lg bg-secondary-300" />
          </Skeleton>
          <Skeleton
            className="w-2/5 rounded-lg"
            isLoaded={tableDataRef.current != null}
          >
            <div className="h-3 w-full rounded-lg bg-secondary-200" />
          </Skeleton>
        </div>
      )}

      {tableDataRef.current != null && (
        <UploadAction
          recipientKey={recipientKey}
          setRecipientKey={setRecipientKey}
          amountKey={amountKey}
          setAmountKey={setAmountKey}
          onClose={onClose}
          columns={[...tableDataRef.current.columns]}
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
      {tableDataRef.current != null && (
        <AnyTable tableData={tableDataRef.current} />
      )}
    </div>
  );
}
