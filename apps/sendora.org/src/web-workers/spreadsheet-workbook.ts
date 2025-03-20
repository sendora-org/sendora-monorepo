import XLSX from 'xlsx';

self.onmessage = (event: MessageEvent<ArrayBuffer>) => {
  const spreadsheetBuffer = event.data;
  const result = parseWorkBook(spreadsheetBuffer);
  postMessage(result);
};

function parseWorkBook(ab: ArrayBuffer) {
  if (ab.byteLength > 0) {
    const workbook = XLSX.read(ab);
    return workbook.SheetNames;
  }

  return null;
}
