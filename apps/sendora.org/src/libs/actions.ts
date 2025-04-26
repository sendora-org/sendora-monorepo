import { findNetwork, networks } from '@/constants/config';
import dayjs from 'dayjs';
import { isAddress, parseEther, parseUnits } from 'viem';
import {
  type Hex,
  formatEther,
  formatUnits,
  hexToBigInt,
  hexToNumber,
  hexToString,
  isHex,
  numberToHex,
  size,
  stringToHex,
  trim,
} from 'viem';
import { formatWei } from './common';
import { isDecimal, isIntegerString } from './common';
import { formatBigIntNumber, parseAndScaleNumber } from './number';

export const actions = (
  chainId: number,
  txt: string,
  thousandSeparator = ',',
  decimalSeparator = '.',
) => {
  const network = findNetwork('chainId', chainId.toString()) ?? networks[0];

  // address
  if (isAddress(txt, { strict: false })) {
    return [
      {
        label: 'Browser',
        icon: '🌎',
        handler: (txt: string) => {
          window.open(`${network.explorerURL}/address/${txt}`, '_blank');
          return {
            label: '🌎 Browser',
            value: '',
          };
        },
      },
    ];
  }

  // bytes32
  if (isHex(txt) && size(txt) === 32) {
    return [
      {
        label: 'Address',
        icon: '💰',
        handler: (txt: string) => {
          const result = trim(txt as Hex);

          return {
            label: '💰 Address',
            value: result,
          };
        },
      },
      {
        label: 'Number',
        icon: '🔢',
        handler: (txt: string) => {
          const result = hexToBigInt(txt as Hex);

          return {
            label: '🔢 Number',
            value: formatBigIntNumber(
              result * 10n ** 18n,
              thousandSeparator,
              decimalSeparator,
            ),
          };
        },
      },
      {
        label: 'String',
        icon: '🔤',
        handler: (txt: string) => {
          const result = hexToString(txt as Hex);

          return {
            label: '🔤 String',
            value: result,
          };
        },
      },

      {
        label: 'Trim',
        icon: '✂️',
        handler: (txt: string) => {
          const result = trim(txt as Hex);

          return {
            label: '✂️ Trim',
            value: result,
          };
        },
      },
      {
        label: 'Browser',
        icon: '🌎',
        handler: (txt: string) => {
          window.open(`${network.explorerURL}/tx/${txt}`, '_blank');

          return {
            label: '🌎 Browser',
            value: '',
          };
        },
      },
    ];
  }

  // bytes 32n
  if (isHex(txt) && size(txt) > 32 && size(txt) % 32 === 0) {
    const rawHex = txt.startsWith('0x') ? txt.slice(2) : txt;
    const groups: `${string}`[] = [];

    const groupSize = 32; // 32 bytes
    const bytesPerGroup = groupSize * 2;
    for (let i = 0; i < rawHex.length; i += bytesPerGroup) {
      groups.push(`0x${rawHex.slice(i, i + bytesPerGroup)}`);
    }
    return [
      {
        label: 'Split',
        icon: '✂️',
        handler: (txt: string) => {
          return {
            label: '✂️ Split',
            value: groups.join('\n'),
          };
        },
      },
    ];
  }

  // bytes
  if (isHex(txt) && size(txt) >= 1) {
    return [
      {
        label: 'Gas Price',
        icon: '⛽',
        handler: (txt: string) => {
          const result = hexToBigInt(txt as Hex);

          return {
            label: '⛽ Gas Price',
            value: formatWei(result),
          };
        },
      },
      {
        label: 'Number',
        icon: '🔢',
        handler: (txt: string) => {
          const result = hexToBigInt(txt as Hex);

          return {
            label: '🔢 Number',
            value: formatBigIntNumber(
              result * 10n ** 18n,
              thousandSeparator,
              decimalSeparator,
            ),
          };
        },
      },

      {
        label: 'String',
        icon: '🔤',
        handler: (txt: string) => {
          const result = hexToString(txt as Hex);
          return {
            label: '🔤 String',
            value: result,
          };
        },
      },
      {
        label: 'Trim',
        icon: '✂️',
        handler: (txt: string) => {
          const result = trim(txt as Hex);

          return {
            label: '✂️ Trim',
            value: result,
          };
        },
      },
    ];
  }

  // decimal
  if (isDecimal(txt)) {
    return [
      {
        label: 'μUSDT',
        icon: '💰',
        handler: (txt: string) => {
          return {
            label: '💰 μUSDT',
            value: parseUnits(txt, 6),
          };
        },
      },
      {
        label: 'Wei',
        icon: '⛽',
        handler: (txt: string) => {
          return {
            label: '⛽ Wei',
            value: parseEther(txt),
          };
        },
      },
    ];
  }

  // integer
  if (isIntegerString(txt)) {
    return [
      {
        label: 'μUSDT',
        icon: '💰',
        handler: (txt: string) => {
          return {
            label: '💰 μUSDT',
            value: parseUnits(txt, 6),
          };
        },
      },
      {
        label: 'USDT',
        icon: '💵',
        handler: (txt: string) => {
          return {
            label: '💵 USDT',
            value: formatBigIntNumber(
              parseAndScaleNumber(formatUnits(BigInt(txt), 6), ',', '.'),
              thousandSeparator,
              decimalSeparator,
            ),
          };
        },
      },
      {
        label: 'Wei',
        icon: '⛽',
        handler: (txt: string) => {
          return {
            label: '⛽ Wei',
            value: parseEther(txt),
          };
        },
      },
      {
        label: 'ETH',
        icon: '🔷',
        handler: (txt: string) => {
          return {
            label: '🔷 ETH',
            value: formatEther(BigInt(txt)),
          };
        },
      },

      {
        label: 'Time',
        icon: '⏰',
        handler: (txt: string) => {
          return {
            label: '⏰ Time',
            value: dayjs.unix(Number(txt)).format('YYYY-MM-DD HH:mm:ss'),
          };
        },
      },

      {
        label: 'Bytes',
        icon: '📦',
        handler: (txt: string) => {
          return {
            label: '📦 Bytes',
            value: numberToHex(BigInt(txt), { size: 32 }),
          };
        },
      },
    ];
  }

  return [
    {
      label: 'Bytes',
      icon: '📦',
      handler: (txt: string) => {
        return {
          label: '📦 Bytes',
          value: stringToHex(txt),
        };
      },
    },

    {
      label: 'Bytes32',
      icon: '📦',
      handler: (txt: string) => {
        return {
          label: '📦 Bytes32',
          value: stringToHex(txt, { size: 32 }),
        };
      },
    },

    {
      label: 'Timestamp',
      icon: '⏰',
      handler: (txt: string) => {
        let ts = 0;
        try {
          if (dayjs(txt).isValid()) {
            ts = dayjs(txt).unix();
          }
        } catch (e) {}

        return {
          label: '⏰ Timestamp',
          value: ts.toString(),
        };
      },
    },
  ];
};
