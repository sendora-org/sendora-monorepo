import { Observable } from 'rxjs';

export class WorkerService {
  private worker: Worker;
  private requestId = 0;
  private pendingRequests = new Map<
    number,
    {
      // biome-ignore  lint/suspicious/noExplicitAny: reason
      resolve: (value: any) => void;
      // biome-ignore  lint/suspicious/noExplicitAny: reason
      reject: (reason?: any) => void;
    }
  >();

  constructor(worker: Worker) {
    this.worker = worker;

    this.worker.onmessage = (
      // biome-ignore  lint/suspicious/noExplicitAny: reason
      event: MessageEvent<{ id: number; result?: any; error?: string }>,
    ) => {
      const { id, result, error } = event.data;
      if (this.pendingRequests.has(id)) {
        // biome-ignore lint/style/noNonNullAssertion: reason
        const { resolve, reject } = this.pendingRequests.get(id)!;
        error ? reject(new Error(error)) : resolve(result);
        this.pendingRequests.delete(id);
      }
    };

    this.worker.onerror = (error) => console.error('Worker Error:', error);
  }
  // biome-ignore  lint/suspicious/noExplicitAny: reason
  request<T>(type: string, payload?: any, rpcUrl?: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      const id = ++this.requestId;

      this.pendingRequests.set(id, {
        resolve: (data) => {
          subscriber.next(data);
          subscriber.complete();
        },
        reject: (error) => subscriber.error(error),
      });

      this.worker.postMessage({ id, type, payload, rpcUrl });

      return () => this.pendingRequests.delete(id);
    });
  }

  terminate() {
    this.worker.terminate();
    this.pendingRequests.clear();
  }
}
