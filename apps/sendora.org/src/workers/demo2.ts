import { Hash } from 'ox';
import { Bytes } from 'ox';

self.onmessage = (event: MessageEvent<string>) => {
  const value = event.data;
  const result = keccak256(value);
  postMessage(result);
};

function keccak256(value: string): string {
  return Bytes.toHex(Hash.keccak256(Bytes.fromString(value)));
}
