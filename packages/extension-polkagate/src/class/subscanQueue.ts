// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

const MAX_REQUESTS_PER_SECOND = 3;

interface QueueTask<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
}

class SubscanRequestQueue {
  private queue: QueueTask<unknown>[] = [];
  private isRunning = false;
  private readonly intervalMs: number;

  constructor(requestsPerSecond: number) {
    this.intervalMs = Math.floor(1000 / requestsPerSecond);
  }

  enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ fn, reject, resolve } as QueueTask<unknown>);
      this.run().catch(console.error);
    });
  }

  private async run(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();

      if (!task) {
        continue;
      }

      try {
        const result = await task.fn();

        task.resolve(result);
      } catch (error) {
        task.reject(error);
      }

      await this.sleep(this.intervalMs);
    }

    this.isRunning = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Subscan free tier: 5 req/sec
export const subscanQueue = new SubscanRequestQueue(MAX_REQUESTS_PER_SECOND);
