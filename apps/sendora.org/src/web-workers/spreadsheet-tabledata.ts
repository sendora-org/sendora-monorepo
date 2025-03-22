import { getColumnCount, numberToLetters } from '@/libs/common';
import XLSX from 'xlsx';
type Input = {
  ab: ArrayBuffer;
  sheetIndex: number;
};

type Column = { label: string; key: string };
type Row = Record<string, unknown> & {
  key: string;
};

type TableData = {
  columns: Column[];
  rows: Row[];
};

self.onmessage = (event: MessageEvent<Input>) => {
  const { ab: spreadsheetBuffer, sheetIndex } = event.data;
  const result = parseTableData(spreadsheetBuffer, sheetIndex);
  postMessage(result);
};

function parseTableData(ab: ArrayBuffer, sheetIndex: number) {
  if (ab.byteLength > 0) {
    const workbook = XLSX.read(ab, { cellNF: true, dense: true });

    // biome-ignore lint/suspicious/noExplicitAny: reason
    const rawData: any[] = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[sheetIndex]],
      {
        raw: false,
        header: 1,
        blankrows: false,
      },
    );

    const columns: Column[] = [];
    const rows: Row[] = [];

    const columnCount = getColumnCount(
      // @ts-ignore
      workbook.Sheets[workbook.SheetNames[sheetIndex]]['!ref'],
    );

    for (let i = 0; i < rawData.length; i++) {
      if (i === 0) {
        for (let j = 0; j < columnCount; j++) {
          columns.push({
            key: numberToLetters(j + 1),
            label:
              rawData[0].length === columnCount
                ? rawData[0][j]
                : numberToLetters(j + 1),
          });
        }
      } else {
        const rowItem: Row = { key: String(i + 1) };
        rawData[i].forEach((cell: unknown, cellIndex: number) => {
          rowItem[numberToLetters(cellIndex + 1)] = String(cell);
        });
        rows.push(rowItem);
      }
    }

    console.log(columns)
   
    return {
      columns,
      rows,
    };
  }

  return null;
}
