// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AccountContext } from '../components';
import { updateMeta } from '../messaging';
import useAccountSelectedChain from './useAccountSelectedChain';

export default function useUpdateSelectedAccount (address: string | undefined, changeUrl = false, onClose?: () => void): void {
  const { accounts } = useContext(AccountContext);
  const location = useLocation();
  const navigate = useNavigate();

  const savedSelectedChain = useAccountSelectedChain(address);

  const changePath = useCallback(async (newAddress: string) => {
    const pathParts = location.pathname.split('/');

    // Validate expected path format
    if (pathParts.length < 4) {
      console.warn('Unexpected path structure:', location.pathname);

      return;
    }

    if (savedSelectedChain) {
      pathParts[2] = savedSelectedChain;
    }

    pathParts[3] = newAddress;

    const newPath = pathParts.join('/');

    return await navigate(newPath);
  }, [location.pathname, navigate, savedSelectedChain]);

  const handleExit = useCallback(() => {
    if (!address) {
      return;
    }

    changeUrl && changePath(address).then(() => {
      onClose && onClose();
    }).catch(console.error);

    onClose && onClose();
  }, [address, changePath, changeUrl, onClose]);

  useEffect(() => {
    if (!address) {
      return;
    }

    const accountToUnselect = accounts.find(({ selected }) => selected);

    if (!accountToUnselect) {
      updateMeta(address, JSON.stringify({ selected: true })).catch(console.error);

      return;
    }

    if (accountToUnselect.address !== address) {
      Promise
        .all(
          [
            updateMeta(address, JSON.stringify({ selected: true })),
            updateMeta(accountToUnselect.address, JSON.stringify({ selected: false }))
          ])
        .catch(console.error)
        .finally(handleExit);
    } else {
      changeUrl && changePath(address).catch(console.error);
    }
    // We intentionally use accounts.length instead of accounts to avoid unnecessary re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts.length, address, changePath, changeUrl]);
}
