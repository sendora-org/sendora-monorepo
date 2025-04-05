import H3Title from '@/components/h3-title';
import H4Title from '@/components/h4-title';
import { Divider } from '@heroui/react';
export const Abcfc = () => {
  return (
    <dl className="flex flex-col gap-4 py-4 w-full md:w-[350px]">
      <H4Title>
        <span className="font-bold">Overview</span>
      </H4Title>

      <div className="flex justify-between">
        <dt className="text-small text-default-300">Network</dt>
        <dd className="text-small font-semibold text-default-500">Mainnet</dd>
      </div>

      <div className="flex justify-between">
        <dt className="text-small text-default-300">Token</dt>
        <dd className="text-small font-semibold text-default-500">ETH</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-small text-default-300">Pricint Currency</dt>
        <dd className="text-small font-semibold text-default-500">CNY</dd>
      </div>

      <div className="flex justify-between">
        <dt className="text-small text-default-300">Rate</dt>
        <dd className="text-small font-semibold text-default-500">
          1ETH = 1000 CNY
        </dd>
      </div>

      <div className="flex justify-between">
        <dt className="text-small text-default-300">Total amount</dt>
        <dd className="text-small font-semibold text-default-500">
          10,000 CNY / 100ETH
        </dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-small text-default-300">Recipients</dt>
        <dd className="text-small font-semibold text-default-500">10,000</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-small text-default-300">Transactions</dt>
        <dd className="text-small font-semibold text-default-500">100</dd>
      </div>
      <Divider />

      <H4Title>
        <span className="font-bold">Transaction Cost</span>{' '}
      </H4Title>

      <div className="flex justify-between">
        <dt className="text-small text-default-300">Estimated time</dt>
        <dd className="text-small font-semibold text-default-500">40 mins</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-small text-default-300">Gas Price</dt>
        <dd className="text-small font-semibold text-default-500">100 wei</dd>
      </div>

      <div className="flex justify-between">
        <dt className="text-small text-default-300">Network Cost</dt>
        <dd className="text-small font-semibold text-default-500">0.001 BNB</dd>
      </div>

      <div className="flex justify-between">
        <dt className="text-small text-default-300">Fee</dt>
        <dd className="text-small font-semibold text-default-500">0.001 BNB</dd>
      </div>

      <Divider />
    </dl>
  );
};
