// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountRegistration, DeriveStakingQuery } from '@polkadot/api-derive/types';

import { useCallback, useContext, useEffect, useState } from 'react';

import { WorkerContext } from '../components';

export interface ValidatorInformation extends DeriveStakingQuery {
  identity: DeriveAccountRegistration | null | undefined;
}

interface MessageBody {
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
  const [fetchedValidatorsInformation, setFetchedValidatorsInformation] = useState<MessageBody | undefined>(undefined);
  const [savedValidatorsInformation, setSavedValidatorsInformation] = useState<MessageBody | undefined>(undefined);

  const loadFromStorage = useCallback((key: string) => {
    chrome.storage.local.get('validatorsInfo', (res) => {
      const last = res?.['validatorsInfo'] as Record<string, string> ?? {};

      const loaded = last[key] ? JSON.parse(last[key]) as MessageBody : undefined;

      setSavedValidatorsInformation(loaded);
    });
  }, []);

  const saveValidatorsInfoInStorage = useCallback((info: MessageBody) => {
    chrome.storage.local.get('validatorsInfo', (res) => {
      const last = res?.['validatorsInfo'] as Record<string, string> ?? {};
      const key = `${info.genesisHash}`;

      const infoToSave = JSON.stringify(info);

      last[key] = infoToSave;

      chrome.storage.local.set({ validatorsInfo: last }).catch(console.error);
    });
  }, []);

  const fetchAssetOnRelayChain = useCallback(() => {
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
        const receivedMessage = JSON.parse(results) as MessageBody;

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
    fetchAssetOnRelayChain();
    handleWorkerMessages();
  }, [fetchAssetOnRelayChain, fetching, genesisHash, handleWorkerMessages, loadFromStorage]);

  return fetchedValidatorsInformation && fetchedValidatorsInformation.genesisHash === genesisHash
    ? fetchedValidatorsInformation
    : savedValidatorsInformation && savedValidatorsInformation.genesisHash === genesisHash
      ? savedValidatorsInformation
      : undefined;
}
