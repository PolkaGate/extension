// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { updateStorage } from '../util';

export const ACCOUNT_SELECTED_ASSET_ID_IN_STORAGE = 'accountSelectedAssetId';
/**
 * Updates the selected asset ID for a given account address in storage and optionally changes the URL.
 *
 * This custom hook updates the selected asset ID for a specific account address in localStorage.
 * If `changeUrl` is true, it also modifies the current URL to reflect the new asset selection.
 * After updating, it can optionally call an `onClose` callback function.
 *
 * @param {string | undefined} address - The account address for which to update the selected asset ID.
 * @param {string | undefined} genesisHash - The genesis hash of the chain associated with the account.
 * @param {string | number | undefined} assetId - The ID of the asset to be set as selected.
 * @param {boolean} changeUrl - Whether to change the URL after updating the selected asset ID.
 * @param {() => void} [onClose] - Optional callback function to be called after updating and changing the URL.
 */

export default function useUpdateAccountSelectedAsset (address: string | undefined, genesisHash: string | undefined, assetId: string | number | undefined, changeUrl = false, onClose?: () => void): void {
  const location = useLocation();
  const navigate = useNavigate();

  const changePath = useCallback(async () => {
    const pathParts = location.pathname.split('/');

    // Validate expected path format
    if (pathParts.length < 4) {
      console.warn('Unexpected path structure:', location.pathname);

      return;
    }

    if (address) {
      pathParts[2] = address;
    }

    if (genesisHash) {
      pathParts[3] = genesisHash;
    }

    pathParts[4] = String(assetId);

    const newPath = pathParts.join('/');

    return await navigate(newPath);
  }, [location.pathname, genesisHash, address, assetId, navigate]);

  const handleExit = useCallback(() => {
    if (!address || assetId === undefined) {
      return;
    }

    if (changeUrl) {
      changePath()
        .then(() => onClose?.())
        .catch(console.error);
    } else {
      onClose?.();
    }
  }, [address, assetId, changePath, changeUrl, onClose]);

  useEffect(() => {
    if (!address || assetId === undefined || !genesisHash) {
      console.warn('useUpdateAccountSelectedAsset: Missing address, assetId, or genesisHash');

      return;
    }

    updateStorage(ACCOUNT_SELECTED_ASSET_ID_IN_STORAGE, { [address]: assetId })
      .then(handleExit)
      .catch(console.error);
  }, [address, assetId, genesisHash, handleExit]);
}
