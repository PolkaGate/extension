// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE } from '@polkadot/extension-polkagate/src/util/constants';

import { isValidGenesis, updateStorage } from '../util';
import { mapRelayToSystemGenesisIfMigrated } from '../util/migrateHubUtils';

/**
 * Updates the selected chain for a given account address in storage and optionally changes the URL.
 *
 * This custom hook updates the selected chain's genesis hash for a specified account address in localStorage.
 * If `changeUrl` is true, it modifies the current URL to reflect the new selected chain.
 * After updating, it calls an optional `onClose` callback if provided.
 *
 * @param {string | undefined} address - The account address for which to update the selected chain.
 * @param {string | undefined} genesisHash - The genesis hash of the selected chain.
 * @param {boolean} changeUrl - Whether to change the URL after updating the selected chain.
 * @param {() => void} [onClose] - Optional callback to execute after updating and changing the URL.
 */
export default function useUpdateAccountSelectedChain (address: string | undefined, _genesisHash: string | undefined, changeUrl = false, onClose?: () => void): void {
  const location = useLocation();
  const navigate = useNavigate();

  const genesisHash = mapRelayToSystemGenesisIfMigrated(_genesisHash);

  const adjustStakingPath = useCallback(async () => {
    const pathParts = location.pathname.split('/');
    const maybeGenesisIndex = pathParts.findIndex((p) => isValidGenesis(p));

    if (maybeGenesisIndex !== -1 && genesisHash) {
      const stakingGenesisHash = mapRelayToSystemGenesisIfMigrated(genesisHash) ?? '';

      pathParts[maybeGenesisIndex] = stakingGenesisHash;
    }

    const newPath = pathParts.join('/');

    return await navigate(newPath);
  }, [location.pathname, genesisHash, navigate]);

  const changePath = useCallback(async () => {
    if (location.pathname.includes('/fullscreen-stake/')) {
      adjustStakingPath().catch(console.error);

      return;
    }

    const pathParts = location.pathname.split('/');

    // Validate expected path format
    if (pathParts.length < 4) {
      console.warn('Unexpected path structure:', location.pathname);

      return;
    }

    if (genesisHash) {
      pathParts[3] = genesisHash;
    }

    if (address) {
      pathParts[2] = address;
    }

    const newPath = pathParts.join('/');

    return await navigate(newPath);
  }, [location.pathname, genesisHash, address, navigate, adjustStakingPath]);

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
