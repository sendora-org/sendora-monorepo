import { splitLinesIntoChunks } from '@/libs/common';
import {
  formatLocalizedNumberWithSmallNumbers,
  isZero,
  parseLocalizedNumber,
  queryAddressFromENS,
  queryNameFromENS,
  removeNumberNoise,
  splitByEthereumAddress,
} from '@/libs/common';
import { flattenArray } from '@/libs/common';
import { PromisePool } from '@supercharge/promise-pool';
// @ts-ignore
import countBy from 'lodash.countby';
import { isAddress } from 'viem';
type Input = {
  data: string;
  thousandSeparators: string[];
  decimalSeparator: '.' | ',';
};

self.onmessage = async (event: MessageEvent<Input>) => {
  const result = await handler(event.data);

  postMessage(result);
};

async function handler(input: Input) {
  const { data, thousandSeparators, decimalSeparator } = input;
  const chunks = splitLinesIntoChunks(data, 1000);
  const { results } = await PromisePool.withConcurrency(1)
    .for(chunks)
    .process(async (chunk) => {
      const newchunk = chunk.map((line: string) => {
        const arr = splitByEthereumAddress(line);
        let addressType = 'string';
        let amount = arr.length >= 2 ? removeNumberNoise(arr[1].trim()) : '';
        if (isAddress(arr[0], { strict: false })) {
          addressType = 'address';
        } else {
          if (arr[0].endsWith('.eth')) {
            addressType = '.eth';
          }
          if (arr[0].endsWith('.bnb')) {
            addressType = '.bnb';
          }
          if (arr[0].endsWith('.base.eth')) {
            addressType = '.base.eth';
          }
          if (arr[0].endsWith('.arb')) {
            addressType = '.arb';
          }
        }

        //       export type ReceipientStatus =
        // | { status: 'wrongAddress'; message: 'Wrong Address' }
        // | { status: 'duplicateAddress'; message: 'Duplicate Address' } //
        // | { status: 'valid'; message: 'Valid' } //

        // | { status: 'zeroAmount'; message: 'Zero Amount' }
        // | { status: 'wrongAmount'; message: 'Wrong Amount' }
        // | { status: 'emptyAmount'; message: 'Empty Amount' };

        let amountErrorType = '';

        if (amount === '' && arr.length === 1) {
          amountErrorType = 'emptyAmount';
        }

        if (amount === '' && arr.length >= 2) {
          amountErrorType = 'wrongAmount';
        }

        if (isZero(amount)) {
          amountErrorType = 'zeroAmount';
        }

        if (amountErrorType === '') {
          const amountNumber = parseLocalizedNumber(
            amount,
            decimalSeparator,
            thousandSeparators,
          );
          if (amountNumber == null) {
            amountErrorType = 'wrongAmount';
          } else {
            amount = String(amountNumber);
          }
        }

        if (amountErrorType === 'wrongAmount') {
          const amountStr = arr[1].trim().startsWith(',')
            ? arr[1].trim().slice(1)
            : arr[1].trim();
          amount = arr.length >= 2 ? amountStr : '';
        }

        return {
          input: arr[0],
          isReceipientValid: addressType !== 'string',
          amountErrorType: amountErrorType,
          addressType,
          address: addressType === 'address' ? arr[0] : '',
          ensName:
            addressType !== 'address' && addressType !== 'string' ? arr[0] : '',
          amount,
        };
      });

      const ensOnEth = newchunk
        .filter((item) => {
          return item.addressType === '.eth';
        })
        .map((item) => {
          return item.ensName;
        });
      const ensOnEthBase = newchunk
        .filter((item) => {
          return item.addressType === '.base.eth';
        })
        .map((item) => {
          return item.ensName;
        });
      const ensOnBnb = newchunk
        .filter((item) => {
          return item.addressType === '.bnb';
        })
        .map((item) => {
          return item.ensName;
        });
      const ensOnArb = newchunk
        .filter((item) => {
          return item.addressType === '.arb';
        })
        .map((item) => {
          return item.ensName;
        });

      const addressesOnAddr = newchunk
        .filter((item) => {
          return item.addressType === 'address';
        })
        .map((item) => {
          return item.address;
        });

      // const names = await queryNameFromENS(addressesOnAddr);

      const ethAddrs = await queryAddressFromENS('.eth', ensOnEth);
      const baseAddrs = await queryAddressFromENS('.base.eth', ensOnEthBase);
      const arbAddrs = await queryAddressFromENS('.arb', ensOnArb);
      const bnbAddrs = await queryAddressFromENS('.bnb', ensOnBnb);

      const abc = newchunk.map((item) => {
        if (item.addressType === 'address') {
          // const { status, result } = names.find(
          //   (result) => result.id === item.address,
          // );
          // return {
          //   ...item,
          //   ensName: status === 'success' ? result[0] : '',
          // };

          return {
            ...item,
            ensName: '',
          };
        }
        if (item.addressType === '.eth') {
          const { status, result } = ethAddrs.find(
            (result) => result.id === item.ensName,
          ) ?? {
            status: 'failure',
            result: '',
          };
          return {
            ...item,
            address: status === 'success' ? result : '',
          };
        }

        if (item.addressType === '.base.eth') {
          const { status, result } = baseAddrs.find(
            (result) => result.id === item.ensName,
          ) ?? {
            status: 'failure',
            result: '',
          };
          return {
            ...item,
            address: status === 'success' ? result : '',
          };
        }

        if (item.addressType === '.bnb') {
          const { status, result } = bnbAddrs.find(
            (result) => result.id === item.ensName,
          ) ?? {
            status: 'failure',
            result: '',
          };
          return {
            ...item,
            address: status === 'success' ? result : '',
          };
        }

        if (item.addressType === '.arb') {
          const { status, result } = arbAddrs.find(
            (result) => result.id === item.ensName,
          ) ?? {
            status: 'failure',
            result: '',
          };
          return {
            ...item,
            address: status === 'success' ? result : '',
          };
        }

        return item;
      });

      return abc;
    });

  const lines = flattenArray(results);
  const keyCount = countBy(lines, 'address');
  return lines.map((item, index) => {
    let status = 'valid';

    if (keyCount[item.address] > 1) {
      status = 'duplicateAddress';
    }

    if (item.addressType === 'string') {
      status = 'wrongAddress';
    } else {
      if (item.addressType !== 'address' && item.address === '') {
        status = 'wrongAddress';
      }
    }

    if (status === 'valid') {
      if (item.amountErrorType !== '') {
        status = item.amountErrorType;
      }
    }

    return {
      ...item,
      isReceipientDuplicate: keyCount[item.address] > 1,
      status,

      name: item.input,
      id: index + 1,
    };
  });
}
