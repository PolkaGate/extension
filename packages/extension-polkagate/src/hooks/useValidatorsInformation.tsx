// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountRegistration, DeriveStakingQuery } from '@polkadot/api-derive/types';

import { useCallback, useContext, useEffect, useState } from 'react';

import { WorkerContext } from '../components';

export interface ValidatorInformation extends DeriveStakingQuery {
  identity: DeriveAccountRegistration | null | undefined;
}

export interface ValidatorsInformation {
  eraIndex: number;
  genesisHash: string;
  validatorsInformation: {
    elected: ValidatorInformation[];
    waiting: ValidatorInformation[];
  };
}

interface WorkerMessage {
  functionName?: string;
  results?: string;
}

export default function useValidatorsInformation (genesisHash: string | undefined) {
  const worker = useContext(WorkerContext);

  const [fetching, setFetching] = useState<string | undefined>();
  const [fetchedValidatorsInformation, setFetchedValidatorsInformation] = useState<ValidatorsInformation | undefined>(undefined);
  const [savedValidatorsInformation, setSavedValidatorsInformation] = useState<ValidatorsInformation | undefined>(undefined);

  const loadFromStorage = useCallback((key: string) => {
    chrome.storage.local.get('validatorsInfo', (res) => {
      const last = res?.['validatorsInfo'] as Record<string, string> ?? {};

      const loaded = last[key] ? JSON.parse(last[key]) as ValidatorsInformation : undefined;

      setSavedValidatorsInformation(loaded);
    });
  }, []);

  const saveValidatorsInfoInStorage = useCallback((info: ValidatorsInformation) => {
    chrome.storage.local.get('validatorsInfo', (res) => {
      const last = res?.['validatorsInfo'] as Record<string, string> ?? {};
      const key = `${info.genesisHash}`;

      const infoToSave = JSON.stringify(info);

      last[key] = infoToSave;

      chrome.storage.local.set({ validatorsInfo: last }).catch(console.error);
    });
  }, []);

  const fetchValidatorsInformation = useCallback(() => {
    if (!worker || !genesisHash) {
      return;
    }

    const functionName = 'getValidatorsInformation';

    worker.postMessage({ functionName, parameters: { genesisHash } });
  }, [genesisHash, worker]);

  const handleWorkerMessages = useCallback(() => {
    if (!worker) {
      return;
    }

    const handleMessage = (messageEvent: MessageEvent<string>) => {
      const message = messageEvent.data;

      if (!message) {
        return; // may receive unknown messages!
      }

      const { functionName, results } = JSON.parse(message) as WorkerMessage;

      if (!functionName) {
        return;
      }

      if (!results) {
        return;
      }

      if (functionName === 'getValidatorsInformation') {
        const receivedMessage = JSON.parse(results) as ValidatorsInformation;

        setFetchedValidatorsInformation(receivedMessage);
        saveValidatorsInfoInStorage(receivedMessage);
      }
    };

    worker.addEventListener('message', handleMessage);

    return () => {
      worker.removeEventListener('message', handleMessage);
    };
  }, [saveValidatorsInfoInStorage, worker]);

  useEffect(() => {
    if (!genesisHash || fetching === genesisHash) {
      return;
    }

    setFetching(genesisHash);
    loadFromStorage(genesisHash);
    fetchValidatorsInformation();
    handleWorkerMessages();
  }, [fetchValidatorsInformation, fetching, genesisHash, handleWorkerMessages, loadFromStorage]);

  return fetchedValidatorsInformation && fetchedValidatorsInformation.genesisHash === genesisHash
    ? fetchedValidatorsInformation
    : savedValidatorsInformation && savedValidatorsInformation.genesisHash === genesisHash
      ? savedValidatorsInformation
      : undefined;
}
