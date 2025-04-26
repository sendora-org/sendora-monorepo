import XLSX from 'xlsx';

self.onmessage = (event: MessageEvent<ArrayBuffer>) => {
  const spreadsheetBuffer = event.data;
  const result = parseWorkBook(spreadsheetBuffer);
  postMessage(result);
};

function parseWorkBook(ab: ArrayBuffer) {
  if (ab.byteLength > 0) {
    // const workbook = XLSX.read(ab);

    // https://docs.sheetjs.com/docs/demos/bigdata/stream
    // Reduce memory usage.
    // A million rows in a spreadsheet can reduce peak memory usage by about half.
    const workbook = XLSX.read(ab, { dense: true });
    return workbook.SheetNames;
  }

  return null;
}
