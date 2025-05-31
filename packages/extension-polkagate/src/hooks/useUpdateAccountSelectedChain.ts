// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { updateStorage } from '../util';
import { ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE } from './useAccountSelectedChain';

export default function useUpdateAccountSelectedChain (address: string | undefined, genesisHash: string | undefined, changeUrl = false, onClose?: () => void): void {
  const location = useLocation();
  const navigate = useNavigate();

  const changePath = useCallback(async () => {
    const pathParts = location.pathname.split('/');

    // Validate expected path format
    if (pathParts.length < 4) {
      console.warn('Unexpected path structure:', location.pathname);

      return;
    }

    if (genesisHash) {
      pathParts[2] = genesisHash;
    }

    if (address) {
      pathParts[3] = address;
    }

    const newPath = pathParts.join('/');

    return await navigate(newPath);
  }, [location.pathname, genesisHash, address, navigate]);

  const handleExit = useCallback(() => {
    if (!address) {
      return;
    }

    changeUrl && changePath().then(() => {
      onClose && onClose();
    }).catch(console.error);

    onClose && onClose();
  }, [address, changePath, changeUrl, onClose]);

  useEffect(() => {
    if (!address || !genesisHash) {
      return;
    }

    updateStorage(ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE, { [address]: genesisHash })
      .then(handleExit)
      .catch(console.error);
  }, [address, genesisHash, handleExit]);
}
