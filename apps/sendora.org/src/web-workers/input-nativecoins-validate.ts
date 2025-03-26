import { splitLinesIntoChunks } from '@/libs/common';
import {
  isZero,
  queryAddressFromENS,
  removeNumberNoise,
  splitByEthereumAddress,
} from '@/libs/common';
import { flattenArray } from '@/libs/common';
import { parseAndScaleNumber } from '@/libs/number';
import { PromisePool } from '@supercharge/promise-pool';
// @ts-ignore
import countBy from 'lodash.countby';
import { isAddress } from 'viem';

type Input = {
  data: string;
  thousandSeparator: string;
  decimalSeparator: '.' | ',';
};

self.onmessage = async (event: MessageEvent<Input>) => {
  const result = await handler(event.data);

  postMessage(result);
};

type IStatus =
  | 'valid'
  | 'wrongAddress'
  | 'emptyAmount'
  | 'wrongAmount'
  | 'zeroAmount'
  | 'duplicateAddress';

export type IReceipent = {
  id: number;
  name: string;
  status: IStatus;
  ensName: string;
  address: string;
  addressType: string;
  amount: bigint;
  amountRaw: string;
};

async function handler(input: Input) {
  const { data, thousandSeparator, decimalSeparator } = input;
  const chunks = splitLinesIntoChunks(data, 1000);
  const { results } = await PromisePool.withConcurrency(1)
    .for(chunks)
    .process(async (chunk) => {
      const newchunk = chunk.map((line: string) => {
        const arr = splitByEthereumAddress(line);
        let addressType = 'string';
        const amount = arr.length >= 2 ? removeNumberNoise(arr[1].trim()) : '';
        let amountBigInt = 0n;
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
          try {
            amountBigInt = parseAndScaleNumber(
              amount,
              thousandSeparator,
              decimalSeparator,
            );
          } catch (e) {
            amountErrorType = 'wrongAmount';
          }
        }

        return {
          input: arr[0],
          isReceipientValid: addressType !== 'string',
          amountErrorType: amountErrorType,
          addressType,
          address: addressType === 'address' ? arr[0] : '',
          ensName:
            addressType !== 'address' && addressType !== 'string' ? arr[0] : '',
          amount: amountBigInt,
          amountRaw: amount,
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
  const newLines = lines.map((item, index) => {
    let status = 'valid';

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

    if (status === 'valid') {
      if (keyCount[item.address] > 1) {
        status = 'duplicateAddress';
      }
    }

    return {
      id: index + 1,
      name: item.input,
      status,
      ensName: item.ensName,
      address: item.address,
      addressType: item.addressType,
      amount: item.amount,
      amountRaw: item.amountRaw,
    };
  });

  return newLines;
}
