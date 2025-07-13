// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AccountContext } from '../components';
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
  const { accounts } = useContext(AccountContext);
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

    const account = accounts.find((acc) => acc.address === address);

    setStorage(SELECTED_ACCOUNT_IN_STORAGE, account).finally(() => handleExit()).catch(console.error);

    // Using accounts.length here to avoid unnecessary re-renders due to deep object comparison
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts.length, address, handleExit]);
}
