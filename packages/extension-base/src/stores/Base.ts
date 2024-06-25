// Copyright 2019-2024 @polkadot/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

type StoreValue = Record<string, unknown>;

const lastError = (type: string): void => {
  const error = browser.runtime.lastError;

  if (error) {
    console.error(`BaseStore.${type}:: runtime.lastError:`, error);
  }
};

export default abstract class BaseStore<T> {
  #prefix: string;

  constructor(prefix: string | null) {
    this.#prefix = prefix ? `${prefix}:` : '';
  }

  public all(update: (key: string, value: T) => void): void {
    this.allMap((map): void => {
      Object.entries(map).forEach(([key, value]): void => {
        update(key, value);
      });
    });
  }

  public allMap(update: (value: Record<string, T>) => void): void {
    browser.storage.local.get().then((result: StoreValue): void => {
      lastError('all');

      const entries = Object.entries(result);
      const map: Record<string, T> = {};

      for (let i = 0; i < entries.length; i++) {
        const [key, value] = entries[i];

        if (key.startsWith(this.#prefix)) {
          map[key.replace(this.#prefix, '')] = value as T;
        }
      }

      update(map);
    });
  }

  public get(_key: string, update: (value: T) => void): void {
    const key = `${this.#prefix}${_key}`;

    browser.storage.local.get([key]).then((result: StoreValue): void => {
      lastError('get');

      update(result[key] as T);
    });
  }

  public remove(_key: string, update?: () => void): void {
    const key = `${this.#prefix}${_key}`;

    browser.storage.local.remove(key).then((): void => {
      lastError('remove');

      update && update();
    });
  }

  public set(_key: string, value: T, update?: () => void): void {
    const key = `${this.#prefix}${_key}`;

    browser.storage.local.set({ [key]: value }).then((): void => {
      lastError('set');

      update && update();
    });
  }
}
