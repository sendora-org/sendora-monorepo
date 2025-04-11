import { delay, flattenArray } from '@/libs/common';
import {
  isZero,
  removeNumberNoise,
  splitByEthereumAddress,
} from '@/libs/common';
import { queryAddressFromENS } from '@/libs/common';
import { DataManager } from '@/libs/data-manager';
import { parseAndScaleNumber } from '@/libs/number';
import { PromisePool } from '@supercharge/promise-pool';
// @ts-ignore
import countBy from 'lodash.countby';
import { isAddress } from 'viem';

// @ts-ignore
import chunk from 'lodash.chunk';
interface Item {
  id: number;
  raw: string;
  // biome-ignore  lint/suspicious/noExplicitAny: reason
  [key: string]: any;
}

const store = new DataManager<Item>([]);

self.onmessage = async ({
  data,
  // biome-ignore  lint/suspicious/noExplicitAny: reason
}: { data: { id: number; type: string; payload: any; rpcUrl?: string } }) => {
  const { id, type, payload, rpcUrl } = data;
  // biome-ignore  lint/suspicious/noExplicitAny: reason
  let result: any;
  switch (type) {
    case 'reset': {
      if (payload === '') {
        store.reset([]);
      } else {
        store.reset(
          payload
            .split('\n')
            // biome-ignore  lint/suspicious/noExplicitAny: reason
            .map((item: any, index: number) => ({ id: index, raw: item })),
        );
      }
      result = 'ok';
      break;
    }

    case 'validate': {
      // console.log('validate', { payload }, store.getIdIndex());
      const { thousandSeparator, decimalSeparator } = payload;
      const chunks = chunk(store.getIdIndex(), 20000);

      const { results } = await PromisePool.withConcurrency(1)
        .for(chunks)
        // biome-ignore  lint/suspicious/noExplicitAny: reason
        .process(async (_chunk: any) => {
          await delay(100);

          const newchunk = _chunk.map((id: number) => {
            const item = store.get(id);
            const arr = splitByEthereumAddress(item?.raw ?? '');
            let addressType = 'string';
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

            const amount =
              arr.length >= 2 ? removeNumberNoise(arr[1].trim()) : '';
            let amountBigInt = 0n;
            let amountErrorType = '';

            if (amount === '' && arr.length === 1) {
              amountErrorType = 'emptyAmount';
            }

            if (amount === '' && arr.length >= 2) {
              amountErrorType = 'wrongAmount';
            }

            if (amountErrorType === '') {
              try {
                amountBigInt = parseAndScaleNumber(
                  amount,
                  thousandSeparator,
                  decimalSeparator,
                );

                if (amountBigInt === 0n) {
                  amountErrorType = 'zeroAmount';
                }
              } catch (e) {
                amountErrorType = 'wrongAmount';
              }
            }
            return {
              name: arr[0],
              amountErrorType: amountErrorType,
              addressType,
              address: addressType === 'address' ? arr[0] : '',
              ensName:
                addressType !== 'address' && addressType !== 'string'
                  ? arr[0]
                  : '',
              amount: amountBigInt,
              amountRaw: amount,
            };
          });

          const ensOnEth = newchunk
            .filter((item: { addressType: string }) => {
              return item.addressType === '.eth';
            })
            .map((item: { ensName: string }) => {
              return item.ensName;
            });
          const ensOnEthBase = newchunk
            .filter((item: { addressType: string }) => {
              return item.addressType === '.base.eth';
            })
            .map((item: { ensName: string }) => {
              return item.ensName;
            });
          const ensOnBnb = newchunk
            .filter((item: { addressType: string }) => {
              return item.addressType === '.bnb';
            })
            .map((item: { ensName: string }) => {
              return item.ensName;
            });
          const ensOnArb = newchunk
            .filter((item: { addressType: string }) => {
              return item.addressType === '.arb';
            })
            .map((item: { ensName: string }) => {
              return item.ensName;
            });

          console.log('before send base eth req');
          const ethAddrs = await queryAddressFromENS('.eth', ensOnEth, rpcUrl);
          const baseAddrs = await queryAddressFromENS(
            '.base.eth',
            ensOnEthBase,
            rpcUrl,
          );
          const arbAddrs = await queryAddressFromENS('.arb', ensOnArb, rpcUrl);
          const bnbAddrs = await queryAddressFromENS('.bnb', ensOnBnb, rpcUrl);

          const chunkWithENS = newchunk.map(
            (item: {
              addressType: string;
              ensName: string;
              amountErrorType: string;
              id: number;
            }) => {
              if (item.addressType === 'string') {
                return {
                  ...item,
                  ensName: '',
                  status: 'wrongAddress',
                };
              }

              if (item.addressType === 'address') {
                return {
                  ...item,
                  ensName: '',
                  status:
                    item.amountErrorType !== ''
                      ? item.amountErrorType
                      : 'valid',
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
                  status:
                    status !== 'success'
                      ? 'wrongAddress'
                      : item.amountErrorType !== ''
                        ? item.amountErrorType
                        : 'valid',
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
                  status:
                    status !== 'success'
                      ? 'wrongAddress'
                      : item.amountErrorType !== ''
                        ? item.amountErrorType
                        : 'valid',
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
                  status:
                    status !== 'success'
                      ? 'wrongAddress'
                      : item.amountErrorType !== ''
                        ? item.amountErrorType
                        : 'valid',
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
                  key: item.id,
                  address: status === 'success' ? result : '',
                  status:
                    status !== 'success'
                      ? 'wrongAddress'
                      : item.amountErrorType !== ''
                        ? item.amountErrorType
                        : 'valid',
                };
              }

              return item;
            },
          );

          return chunkWithENS;
        });

      // if (status === 'valid') {
      //   if (keyCount[item.address] > 1) {
      //     status = 'duplicateAddress';
      //   }
      // }
      const lines = flattenArray(results);
      const keyCount = countBy(lines, 'address');

      // biome-ignore  lint/suspicious/noExplicitAny: reason
      const newLines = lines.map((item: any, index) => {
        let status = item.status;
        if (status === 'valid') {
          if (keyCount[item.address] > 1) {
            status = 'duplicateAddress';
          }
        }
        return {
          ...item,
          id: index + 1,
          status,
        };
      });

      store.reset(newLines);

      result = 'ok';

      break;
    }

    case 'count': {
      result = store.count() || null;
      break;
    }

    case 'query': {
      result = store.query(payload) || null;
      break;
    }
    case 'update': {
      store.update(payload.id, payload.data);
      break;
    }
    case 'deleteBatchByOptions': {
      store.deleteBatchByOptions(payload);
      break;
    }

    case 'deleteBatchByIds': {
      store.deleteBatchByIds(payload);
      break;
    }

    case 'getAll': {
      console.log('getALL');
      result = store.getAll();
      break;
    }
    default: {
      result = { error: 'Unknown request type' };
    }
  }

  self.postMessage({ id, result });
};
