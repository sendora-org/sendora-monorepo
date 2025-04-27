import type { Column, Row } from '@/libs/common';

type Input = {
  recipientKey: string;
  amountKey: string;
  tableData: {
    columns: Column[];
    rows: Row[];
  };
};
self.onmessage = (event: MessageEvent<Input>) => {
  const spreadsheetBuffer = event.data;
  const result = tabledataOp1(spreadsheetBuffer);
  postMessage(result);
};

function tabledataOp1(input: Input) {
  const { recipientKey, amountKey, tableData } = input;
  const data = tableData.rows
    .map((row) => {
      return `${row[recipientKey] ?? ''},${row[amountKey] ?? ''}`;
    })
    .join('\n');
  return data;
}
