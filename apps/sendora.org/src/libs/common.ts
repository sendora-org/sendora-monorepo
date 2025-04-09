import { findNetwork, networks } from '@/constants/config';
import {
  http,
  createPublicClient,
  decodeFunctionResult,
  encodeFunctionData,
  namehash,
  toHex,
} from 'viem';
import type { Chain, Hex } from 'viem';
import { arbitrum, base, bsc, mainnet } from 'viem/chains';
import { normalize, packetToBytes } from 'viem/ens';

import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { composeViemChain } from './wagmi';
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
  _decimals: number,
): string {
  if (min > max) {
    throw new Error('min > max');
  }
  let decimals = _decimals;
  const randomValue = Math.random() * (max - min) + min;
  if (decimals >= 6) {
    decimals = 6;
  }

  if (decimals < 0) {
    decimals = 0;
  }
  return randomValue.toFixed(decimals);
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
export function runWorker2<T, R>(worker: Worker, value: T): Promise<R> {
  return new Promise((resolve, reject) => {
    worker.postMessage(value);

    worker.onmessage = (event: MessageEvent<R>) => {
      resolve(event.data);
      // worker.terminate();
    };

    worker.onerror = (error) => {
      reject(error);
      // worker.terminate();
    };
  });
}

export function runWorker3<T, R>(
  worker: Worker,
  type: string,
  value: T,
): Promise<R> {
  return new Promise((resolve, reject) => {
    worker.postMessage(value);

    worker.onmessage = (event: MessageEvent<R>) => {
      // @ts-ignore
      if (type === event.data.type) {
        resolve(event.data);
      }

      // worker.terminate();
    };

    worker.onerror = (error) => {
      reject(error);
      // worker.terminate();
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

export type ReceipientStatus =
  | { status: 'wrongAddress'; message: 'Wrong Address' }
  | { status: 'duplicateAddress'; message: 'Duplicate Address' }
  | { status: 'valid'; message: 'Valid' }
  | { status: 'zeroAmount'; message: 'Zero Amount' }
  | { status: 'wrongAmount'; message: 'Wrong Amount' }
  | { status: 'emptyAmount'; message: 'Empty Amount' };

export function checkTransaction(
  address: string,
  amount: string | null,
  usedAddresses: string[] = [],
): ReceipientStatus {
  const isAddressValid = address.length > 0 && address.startsWith('0x');

  if (!isAddressValid) {
    return { status: 'wrongAddress', message: 'Wrong Address' };
  }

  if (usedAddresses.includes(address)) {
    return { status: 'duplicateAddress', message: 'Duplicate Address' };
  }

  if (amount === null || amount === '') {
    return { status: 'emptyAmount', message: 'Empty Amount' };
  }

  const parsedAmount = Number.parseFloat(amount);
  if (Number.isNaN(parsedAmount)) {
    return { status: 'wrongAmount', message: 'Wrong Amount' };
  }

  if (parsedAmount === 0) {
    return { status: 'zeroAmount', message: 'Zero Amount' };
  }

  if (parsedAmount > 0) {
    return { status: 'valid', message: 'Valid' };
  }

  return { status: 'wrongAmount', message: 'Wrong Amount' };
}

// Splits a string by extracting an Ethereum address (standard or ENS format) if present.
export function splitByEthereumAddress(input: string): string[] {
  // Regular expression for Ethereum addresses:
  // - Standard: starts with "0x" followed by 40 hex characters
  // - ENS: e.g., "name.eth", "name.base.eth", "name.bnb", "name.arb"
  const ethAddressRegex =
    /^0x[a-fA-F0-9]{40}|[\p{L}\p{N}-]+\.eth|[\p{L}\p{N}-]+\.base.eth|[\p{L}\p{N}-]+\.bnb|[\p{L}\p{N}-]+\.arb/u;

  // Match the regex against the input string
  const match = input.match(ethAddressRegex);

  if (match) {
    const ethAddress = match[0]; // Extract the matched Ethereum address
    const remaining = input.slice(ethAddress.length); // Get the remaining string after the address

    // Return the address and the remaining string as an array
    return [ethAddress, remaining];
  }

  // If no Ethereum address is found, return the input as a single-element array
  return [input];
}

/**
 * Splits a large string by newline (\n) and groups lines into chunks of specified size.
 * @param input - The large input string to split.
 * @param chunkSize - Number of lines per group (default: 1000).
 * @returns An array of string arrays, where each inner array contains up to chunkSize lines.
 */
export function splitLinesIntoChunks(
  input: string,
  chunkSize = 1000,
): string[][] {
  // Validate chunkSize
  if (chunkSize <= 0) {
    throw new Error('chunkSize must be greater than 0');
  }

  // Split the string by newline into an array of lines
  const lines = input.split('\n');

  // Calculate the number of chunks needed
  const totalLines = lines.length;
  const chunkCount = Math.ceil(totalLines / chunkSize);

  // Pre-allocate the result array for better performance
  const result: string[][] = new Array(chunkCount);

  // Populate each chunk
  for (let i = 0; i < chunkCount; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, totalLines);
    result[i] = lines.slice(start, end);
  }

  return result;
}

/**
 * Removes leading and trailing noise characters from a string containing a number,
 * preserving the original number format (including thousand separators, decimal separators, and subscripts).
 * @param input - The input string containing a number with possible noise.
 * @returns The string with leading and trailing noise removed if valid number found,
 *          or original string with trimmed spaces and first comma removed if no valid number.
 */
export function removeNumberNoise(input: string): string {
  // Step 1: Define regex to match number part with noise
  // Matches: optional leading noise, number part (including separators and subscripts), optional trailing noise
  const numberRegex = /^[^0-9]*([0-9₀-₉.,' ]+)[^0-9]*$/;

  // Step 2: Extract the number part
  const match = input.match(numberRegex);
  if (match?.[1]) {
    // Step 3: Return the raw number part without modification if valid number found
    return match[1];
  }

  // Step 4: If no valid number found, trim spaces and remove first comma if present
  let result = input.trim();
  if (result.startsWith(',')) {
    result = result.substring(1).trim();
  }
  return result;
}

export function flattenArray<T>(chunks: T[][]): T[] {
  return chunks.reduce((acc, curr) => acc.concat(curr), []);
}

export const getGasPrice = async (chainId: number) => {
  const network = findNetwork('chainId', chainId.toString()) ?? networks[0];

  const publicClient = createPublicClient({
    chain: composeViemChain(network),
    transport: network ? http(network.rpcURL) : http(),
  });

  const { gasPrice } = await publicClient.estimateFeesPerGas({
    type: 'legacy', // network.isEIP1559Supported ? 'eip1559' : 'legacy'
  });

  return gasPrice ?? 0n;
};

export const queryAddressFromENS = async (ensType: string, names: string[]) => {
  if (names.length === 0) {
    return [];
  }

  const ENSQuery = '0x9cbc881c6184a40f1a5ae2074b40bbd1df3304a3';
  const ENSQueryABI = [
    {
      inputs: [
        { internalType: 'address', name: 'ensRegistry', type: 'address' },
        { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      ],
      name: 'getAddressFromENS',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
  ] as const;

  type Ivalue = {
    register: Hex;
    network: Chain;
  };
  const registerMap: Record<string, Ivalue> = {
    '.bnb': {
      register: '0x08CEd32a7f3eeC915Ba84415e9C07a7286977956',
      network: bsc,
    },
    '.base.eth': {
      register: '0xb94704422c2a1e396835a571837aa5ae53285a95',
      network: base,
    },
    '.eth': {
      register: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
      network: mainnet,
    },
    '.arb': {
      register: '0x4a067EE58e73ac5E4a43722E008DFdf65B2bF348',
      network: arbitrum,
    },
  };

  const network =
    findNetwork('chainId', registerMap[ensType].network.id.toString(10)) ??
    null;

  const publicClient = createPublicClient({
    chain: registerMap[ensType].network,

    transport: network ? http(network.rpcURL) : http(),
  });
  const queryName = (name: string) => {
    const readContractParameters = {
      address: ENSQuery,
      abi: ENSQueryABI,
      functionName: 'getAddressFromENS',
      args: [registerMap[ensType].register, namehash(normalize(name))],
    } as const;

    return readContractParameters;
  };

  const results = await publicClient.multicall({
    contracts: names.map((name) => queryName(name)),
    batchSize: 0,
  });

  return results.map((result, index) => ({
    ...result,
    id: names[index],
  }));
};

export const queryNameFromENS = async (addresses: Hex[]) => {
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  const universalResolverAddress = '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376';

  const universalResolverReverseAbi = [
    {
      name: 'reverse',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ type: 'bytes', name: 'reverseName' }],
      outputs: [
        { type: 'string', name: 'resolvedName' },
        { type: 'address', name: 'resolvedAddress' },
        { type: 'address', name: 'reverseResolver' },
        { type: 'address', name: 'resolver' },
      ],
    },
  ] as const;

  const queryName = (address: Hex) => {
    const reverseNode = `${address.toLowerCase().substring(2)}.addr.reverse`;
    const readContractParameters = {
      address: universalResolverAddress,
      abi: universalResolverReverseAbi,
      functionName: 'reverse',
      args: [toHex(packetToBytes(reverseNode))],
    } as const;
    return readContractParameters;
  };

  const results = await publicClient.multicall({
    contracts: addresses.map((address) => queryName(address)),
  });

  return results.map((result, index) => ({
    ...result,
    id: addresses[index],
  }));
};

export function isZero(value: unknown) {
  if (typeof value === 'number') {
    return value === 0;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return !Number.isNaN(parsed) && parsed === 0;
  }
  return false;
}

export function delay(ms: number): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
}

export function formatWei(wei: string | number): string {
  const weiNum = BigInt(wei);
  if (weiNum < 0 || Number.isNaN(Number(wei))) {
    return 'Invalid input';
  }

  const units = [
    { name: 'wei', power: 0n, threshold: 0n },
    { name: 'Kwei', power: 3n, threshold: 1000n }, // 10^3
    { name: 'Mwei', power: 6n, threshold: 1000n * 10n ** 3n }, // 10^6
    { name: 'Gwei', power: 9n, threshold: 1000n * 10n ** 6n }, // 10^9
    { name: 'Szabo', power: 12n, threshold: 1000n * 10n ** 9n }, // 10^12
    { name: 'Finney', power: 15n, threshold: 1000n * 10n ** 12n }, // 10^15
    { name: 'Ether', power: 18n, threshold: 1000n * 10n ** 15n }, // 10^18
  ];

  for (let i = units.length - 1; i >= 0; i--) {
    const unit = units[i];
    if (weiNum >= unit.threshold || (i === 0 && weiNum < 1000n)) {
      const value = Number(weiNum) / Number(10n ** unit.power);

      const formattedValue = Number.isInteger(value) ? value : value.toFixed(2);
      return `${formattedValue} ${unit.name}`;
    }
  }

  return `${weiNum} wei`;
}
