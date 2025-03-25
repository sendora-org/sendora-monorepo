'use client';
import { runWorker, runWorker2 } from '@/libs/common';
import { Button, Input } from '@heroui/react';
import { useEffect, useRef, useState } from 'react';

export default () => {
  const taffydbRef = useRef<Worker | null>(null);
  const [orderType, setOrderType] = useState('');
  const [orderField, setOrderField] = useState('');
  const [page, setPage] = useState(1);

  const [initCount, setInitCount] = useState(1000000);

  useEffect(() => {
    taffydbRef.current = new Worker(
      new URL('@/web-workers/demo3.ts', import.meta.url),
      { type: 'module' },
    );
    return () => {
      if (taffydbRef.current) {
        taffydbRef.current.terminate();
      }
    };
  }, []);
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

            alert(event.data);
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
            alert(event.data);
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
          alert(result);
        }}
      >
        Calc keccak256 2
      </Button>

      <Button
        onPress={async () => {
          if (taffydbRef.current) {
            const initPayload = {
              type: 'initialize',
              payload: Array.from({ length: initCount }, (_, i) => ({
                id: i + 1,
                name: `User ${i + 1}`,
                age: 20 + (i % 50),
                status: Math.random() > 0.3,
              })),
            };
            console.time('init');
            const initResult = await runWorker2(
              taffydbRef.current,
              initPayload,
            );
            console.timeEnd('init');
            console.log({ initResult });
          }
        }}
      >
        init
      </Button>

      <Button
        onPress={async () => {
          if (taffydbRef.current) {
            const queryPayload = {
              type: 'query',
              payload: {
                // filter: { age: { '>': 55 } },
                sumField: 'age',
                searchField: '',
                searchKey: '',
                sortField: orderField,
                sortOrder: orderType,
                page: page,
                pageSize: 100,
              },
            };

            console.time('query');
            const queryResult = await runWorker2(
              taffydbRef.current,
              queryPayload,
            );
            console.timeEnd('query');
            console.log({ queryResult });
          }
        }}
      >
        query
      </Button>

      <Input
        label="init count"
        type="text"
        value={String(initCount)}
        onValueChange={(v) => setInitCount(Number(v))}
      />

      <Input
        label="set page"
        type="text"
        value={String(page)}
        onValueChange={(v) => setPage(Number(v))}
      />

      <Input
        label="sortField"
        type="text"
        value={orderField}
        onValueChange={setOrderField}
      />
      <Input
        label="sortType"
        type="text"
        value={orderType}
        onValueChange={setOrderType}
      />
    </div>
  );
};
