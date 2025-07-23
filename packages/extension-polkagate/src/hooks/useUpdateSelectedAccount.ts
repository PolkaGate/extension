// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { setStorage } from '../util';
import { SELECTED_ACCOUNT_IN_STORAGE } from '../util/constants';
import { isValidAddress } from '../util/utils';
import useAccountSelectedChain from './useAccountSelectedChain';

/**
 * Checks if the given string is a valid hex-encoded genesis hash.
 */
function isValidGenesis (hash: string): boolean {
  return hash.startsWith('0x') && hash.length === 66;
}

export default function useUpdateSelectedAccount (address: string | undefined, changeUrl = false, onClose?: () => void): void {
  const location = useLocation();
  const navigate = useNavigate();

  const savedSelectedChain = useAccountSelectedChain(address);

  const updatePathWithNewAddress = useCallback((newAddress: string) => {
    if (location.pathname.includes('/fullscreen-stake/')) {
      return;
    }

    const pathParts = location.pathname.split('/');

    const maybeAddressIndex = pathParts.findIndex((p) => isValidAddress(p));
    const maybeGenesisIndex = pathParts.findIndex((p) => isValidGenesis(p));

    // Validate expected path format
    if (maybeAddressIndex === -1) {
      console.warn('Unexpected path structure:', location.pathname);

      return;
    }

    if (savedSelectedChain && maybeGenesisIndex !== -1) {
      pathParts[maybeGenesisIndex] = savedSelectedChain;
    }

    pathParts[maybeAddressIndex] = newAddress;

    const newPath = pathParts.join('/');

    navigate(newPath) as void;
  }, [location.pathname, navigate, savedSelectedChain]);

  const handleExit = useCallback(() => {
    if (!address) {
      return;
    }

    if (!changeUrl && !onClose) {
      return;
    }

    if (changeUrl) {
      updatePathWithNewAddress(address);
      onClose && onClose();
    } else {
      onClose && onClose();
    }
  }, [address, updatePathWithNewAddress, changeUrl, onClose]);

  useEffect(() => {
    if (!address) {
      return;
    }

    setStorage(SELECTED_ACCOUNT_IN_STORAGE, address).finally(() => handleExit()).catch(console.error);
  }, [address, handleExit]);
}
