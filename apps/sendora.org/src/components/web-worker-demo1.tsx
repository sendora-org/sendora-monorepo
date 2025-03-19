'use client';
import { runWorker } from '@/libs/common';
import { Button } from '@heroui/react';
export default () => {
  return (
    <div className="flex gap-1">
      <Button
        onPress={() => {
          const worker = new Worker(
            new URL('@/web-workers/demo1.ts', import.meta.url),
            { type: 'module' },
          );
          const num = 12;
          if (Number.isNaN(num)) return;
          worker.postMessage(num);
          worker.onmessage = (event: MessageEvent<number>) => {
            console.log(` result=> ${event.data}`);
          };
        }}
      >
        Calc fibonacci
      </Button>

      <Button
        onPress={() => {
          const worker = new Worker(
            new URL('@/web-workers/demo2.ts', import.meta.url),
            { type: 'module' },
          );
          const value = '123';
          worker.postMessage(value);
          worker.onmessage = (event: MessageEvent<string>) => {
            console.log(` result=> ${event.data}`);
          };
        }}
      >
        Calc keccak256 1
      </Button>

      <Button
        onPress={async () => {
          const value = '123';
          const worker = new Worker(
            new URL('@/web-workers/demo2.ts', import.meta.url),
            { type: 'module' },
          );
          const result = await runWorker(worker, value);
          console.log({ result });
        }}
      >
        Calc keccak256 2
      </Button>
    </div>
  );
};
