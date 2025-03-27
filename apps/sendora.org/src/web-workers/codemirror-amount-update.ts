type IPayload = {
  raw: string;
  thousandSeparator: string;
  decimalSeparator: '.' | ',';
  isRandom: boolean;
  fixedValue: number;
  minValue: number;
  maxValue: number;
  decimals: number;
};
import { getRandomNumber } from '@/libs/common';
import { formatBigIntNumber, parseAndScaleNumber } from '@/libs/number';

import { splitText } from '@/libs/common';

self.onmessage = (event: MessageEvent<IPayload>) => {
  const payload = event.data;
  const result = updateAmount(payload);
  postMessage(result);
};

function updateAmount(payload: IPayload): string {
  const {
    raw = '',
    thousandSeparator,
    decimalSeparator,
    isRandom = false,
    fixedValue = 0.01,
    minValue = 0.01,
    maxValue = 10,
    decimals = 2,
  } = payload;

  if (!isRandom) {
    return raw
      .split('\n')
      .map((item) => {
        return `${splitText(item)[0]},${formatBigIntNumber(parseAndScaleNumber(fixedValue.toString(), ',', '.'), thousandSeparator, decimalSeparator)}`;
      })
      .join('\n');
  }
  return raw
    .split('\n')
    .map((item) => {
      return `${splitText(item)[0]},${formatBigIntNumber(parseAndScaleNumber(getRandomNumber(minValue, maxValue, decimals), ',', '.'), thousandSeparator, decimalSeparator)}`;
    })
    .join('\n');
}
