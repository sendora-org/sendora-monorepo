import FingerprintJS from '@fingerprintjs/fingerprintjs';
export const getVisitorId = async () => {
  const fpPromise = FingerprintJS.load();
  const fp = await fpPromise;
  const result = await fp.get();
  return result.visitorId;
};

export const shortAddress = (address: string, length = 4) => {
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

export function formatLocalizedNumberWithSmallNumbers(
  number: number,
  decimalSeparator: '.' | ',' = '.',
  thousandSeparator: '.' | ',' | ' ' | `'` | '' = ',',
  decimalPlaces = 4,
): string {
  if (Number.isNaN(number)) return 'NaN';
  if (number === 0) return '0';

  // Handle very small numbers separately
  if (Math.abs(number) < 1 && number.toString().includes('e')) {
    return formatSmallNumber(number);
  }

  let [integerPart, decimalPart] = number.toFixed(decimalPlaces).split('.');

  // Add thousand separators
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

  // Format small decimals correctly
  decimalPart = formatSmallNumberPart(decimalPart, decimalPlaces);

  return decimalPart
    ? `${integerPart}${decimalSeparator}${decimalPart}`
    : integerPart;
}

/**
 * Formats very small numbers using subscript notation when applicable.
 */
export function formatSmallNumber(num: number): string {
  if (num === 0) return '0';

  const str = num.toString();

  // Handle scientific notation (e-notation)
  if (str.includes('e')) {
    const parts = num.toExponential().split('e');
    const base = Number.parseFloat(parts[0]);
    const exponent = Number.parseInt(parts[1]);

    if (exponent < -3) {
      const zeroCount = Math.abs(exponent) - 1;
      return formatWithSubscript(zeroCount, base.toString().replace('.', ''));
    }
    return num.toString();
  }

  // Match numbers with leading zeros in decimal part: 0.0000123 → 0.0₄123
  const match = str.match(/0\.(0+)([1-9]\d*)/);

  if (!match) return str;

  const zeroCount = match[1].length;
  const significantPart = match[2];

  // Only apply subscript formatting if leading zeros are 4 or more
  if (zeroCount < 4) {
    return num.toString();
  }

  return formatWithSubscript(zeroCount, significantPart);
}

function formatSmallNumberPart(
  decimalPart: string,
  decimalPlaces: number,
): string {
  if (!decimalPart) return '';

  // Trim or round to 4 decimal places
  const roundedDecimal = decimalPart.substring(0, decimalPlaces);

  // If all characters are '0', ignore
  if (/^0{1,4}$/.test(roundedDecimal)) return '';

  return roundedDecimal; // Return the valid decimal part
}

/**
 * Applies subscript notation for the zero count.
 * Example: 0.0000123 → 0.0₄123
 */
function formatWithSubscript(
  zeroCount: number,
  significantPart: string,
): string {
  const limitedZeroCount = Math.min(zeroCount, 18); // Limit to 18 zeroes
  const subscriptDigits = limitedZeroCount
    .toString()
    .split('')
    .map(toSubscript)
    .join('');
  return `0.0${subscriptDigits}${significantPart}`;
}

/**
 * Converts a digit to its subscript equivalent.
 */
function toSubscript(digit: string): string {
  const subscriptMap: { [key: string]: string } = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
  };
  return subscriptMap[digit] || digit;
}

export function formatLocalizedNumber(
  number: number,
  decimalSeparator: '.' | ',',
  thousandSeparator = ',',
  decimalPlaces = 2,
): string {
  if (Number.isNaN(number)) return '';

  let [integerPart, decimalPart] = number.toFixed(decimalPlaces).split('.');

  // Add thousand separators
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

  // Add back decimal part with correct separator
  return decimalPart
    ? `${integerPart}${decimalSeparator}${decimalPart}`
    : integerPart;
}

// USA  1,234,567.89
// South Korea 1234567.89
// Germany 1.234.567,89
// France  1 234 567,89
// Switzerland 1'234'567.89

export function parseLocalizedNumber(
  input: string,
  _decimalSeparator: '.' | ',',
  thousandSeparators: string[] = [',', ' ', `'`],
): number | null {
  let decimalSeparator = _decimalSeparator;
  let numberStr = input.trim();

  numberStr = numberStr.replace(
    /0\.0([\u2080-\u2089]+)(\d+)/,
    (_, subscriptDigits, significantPart) => {
      const zeroCount = subscriptDigits.split('').map(fromSubscript).join('');
      const zeroes = '0'.repeat(Number.parseInt(zeroCount, 10));
      return `0.${zeroes}${significantPart}`;
    },
  );

  const dotCount = (numberStr.match(/\./g) || []).length;
  const commaCount = (numberStr.match(/,/g) || []).length;

  if (!decimalSeparator) {
    if (dotCount > 0 && commaCount > 0) {
      decimalSeparator =
        numberStr.lastIndexOf('.') > numberStr.lastIndexOf(',') ? '.' : ',';
    } else if (dotCount > 1) {
      decimalSeparator = ',';
    } else if (commaCount > 1) {
      decimalSeparator = '.';
    }
  }

  for (const sep of thousandSeparators) {
    if (sep !== decimalSeparator) {
      numberStr = numberStr.replace(new RegExp(`\\${sep}`, 'g'), '');
    }
  }

  numberStr = numberStr.replace(decimalSeparator, '.');

  const parsedNumber = Number.parseFloat(numberStr);
  return Number.isNaN(parsedNumber) ? null : parsedNumber;
}

function fromSubscript(subscript: string): string {
  const subscriptMap: { [key: string]: string } = {
    '₀': '0',
    '₁': '1',
    '₂': '2',
    '₃': '3',
    '₄': '4',
    '₅': '5',
    '₆': '6',
    '₇': '7',
    '₈': '8',
    '₉': '9',
  };
  return subscriptMap[subscript] || subscript;
}

// export function parseLocalizedNumber(
//   input: string,
//   _decimalSeparator: '.' | ',',
//   thousandSeparators: string[] = [',', ' ', `'`],
// ): number | null {
//   let decimalSeparator = _decimalSeparator;
//   let numberStr = input.trim();

//   // Count occurrences of `.` and `,`
//   const dotCount = (numberStr.match(/\./g) || []).length;
//   const commaCount = (numberStr.match(/,/g) || []).length;

//   // Determine actual decimal separator if not explicitly given
//   if (!decimalSeparator) {
//     if (dotCount > 0 && commaCount > 0) {
//       // If both '.' and ',' exist, the last occurring one is the decimal separator
//       decimalSeparator =
//         numberStr.lastIndexOf('.') > numberStr.lastIndexOf(',') ? '.' : ',';
//     } else if (dotCount > 1) {
//       decimalSeparator = ',';
//     } else if (commaCount > 1) {
//       decimalSeparator = '.';
//     }
//   }

//   // Remove thousand separators (space, comma, apostrophe, except the decimal separator)
//   for (const sep of thousandSeparators) {
//     if (sep !== decimalSeparator) {
//       numberStr = numberStr.replace(new RegExp(`\\${sep}`, 'g'), '');
//     }
//   }

//   // Convert decimal separator to `.`
//   numberStr = numberStr.replace(decimalSeparator, '.');

//   // Convert to number
//   const parsedNumber = Number.parseFloat(numberStr);
//   return Number.isNaN(parsedNumber) ? null : parsedNumber;
// }

export function getRandomNumber(
  min: number,
  max: number,
  decimals: number,
): number {
  if (min > max) {
    throw new Error('min > max');
  }
  if (decimals < 0) {
    throw new Error('decimals < 0');
  }

  const randomValue = Math.random() * (max - min) + min;
  return Number.parseFloat(randomValue.toFixed(decimals));
}

export function splitText(text: string): string[] {
  return text.split(/[\s,|，|-]+/).filter((word) => word.length > 0);
}

function getDecimals(num: number): number {
  const str = num.toString();
  const decimalIndex = str.indexOf('.');

  if (decimalIndex === -1) {
    return 0;
  }

  return str.length - decimalIndex - 1;
}

export function getDecimalsScientific(num: number): number {
  const str = num.toString();

  if (str.includes('e') || str.includes('E')) {
    const fixedNum = num.toFixed(20);
    return getDecimals(Number.parseFloat(fixedNum));
  }

  return getDecimals(num);
}

// export function runWorker(worker: Worker, value: string): Promise<string> {
//   return new Promise((resolve, reject) => {
//     worker.postMessage(value);

//     worker.onmessage = (event: MessageEvent<string>) => {
//       resolve(event.data);
//       worker.terminate();
//     };

//     worker.onerror = (error) => {
//       reject(error);
//       worker.terminate();
//     };
//   });
// }

// export function runWorker<T>(worker: Worker, value: T): Promise<T> {
//   return new Promise((resolve, reject) => {
//     worker.postMessage(value);

//     worker.onmessage = (event: MessageEvent<T>) => {
//       resolve(event.data);
//       worker.terminate();
//     };

//     worker.onerror = (error) => {
//       reject(error);
//       worker.terminate();
//     };
//   });
// }
export function runWorker<T, R>(worker: Worker, value: T): Promise<R> {
  return new Promise((resolve, reject) => {
    worker.postMessage(value);

    worker.onmessage = (event: MessageEvent<R>) => {
      resolve(event.data);
      worker.terminate();
    };

    worker.onerror = (error) => {
      reject(error);
      worker.terminate();
    };
  });
}

export const getWorkbook = async (ab: ArrayBuffer) => {
  const worker = new Worker(
    new URL('@/web-workers/spreadsheet-workbook.ts', import.meta.url),
    { type: 'module' },
  );
  const result = await runWorker<ArrayBuffer, string[] | null>(worker, ab);
  return result;
};

export type Column = { label: string; key: string };
export type Row = Record<string, unknown> & {
  key: string;
};

export type TableData = {
  columns: Column[];
  rows: Row[];
};

export const getTableData = async (ab: ArrayBuffer, sheetIndex = 0) => {
  const worker = new Worker(
    new URL('@/web-workers/spreadsheet-tabledata.ts', import.meta.url),
    { type: 'module' },
  );
  const input = {
    ab,
    sheetIndex,
  };
  const result = await runWorker<typeof input, TableData | null>(worker, input);
  return result;
};

function columnToIndex(column: string): number {
  let index = 0;
  for (let i = 0; i < column.length; i++) {
    index = index * 26 + (column.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return index;
}

export function getColumnCount(range: string): number {
  const match = range.match(/^([A-Z]+)\d+:([A-Z]+)\d+$/);
  if (!match) {
    throw new Error('Invalid range format');
  }

  const startColumn = match[1];
  const endColumn = match[2];

  const startIndex = columnToIndex(startColumn);
  const endIndex = columnToIndex(endColumn);

  return endIndex - startIndex + 1;
}

export function numberToLetters(tmp: number): string {
  let result = '';
  let num = tmp;
  while (num > 0) {
    num--;
    const remainder = num % 26;
    result = String.fromCharCode(65 + remainder) + result;
    num = Math.floor(num / 26);
  }
  return result;
}
