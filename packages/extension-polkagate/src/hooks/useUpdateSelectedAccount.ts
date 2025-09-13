// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { isValidGenesis, setStorage } from '../util';
import { SELECTED_ACCOUNT_IN_STORAGE } from '../util/constants';
import { mapRelayToSystemGenesisIfMigrated } from '../util/migrateHubUtils';
import { isValidAddress } from '../util/utils';
import useAccountSelectedChain from './useAccountSelectedChain';
import useStakingPositions from './useStakingPositions';

export default function useUpdateSelectedAccount (address: string | undefined, changeUrl = false, onClose?: () => void): void {
  const location = useLocation();
  const navigate = useNavigate();

  const savedSelectedChain = useAccountSelectedChain(address);
  const isStakingPath = location.pathname.includes('/fullscreen-stake/');
  const { maxPosition, maxPositionType } = useStakingPositions(address, isStakingPath);

  const updatePathWithNewAddress = useCallback((newAddress: string) => {
    const pathParts = location.pathname.split('/');

    const maybeAddressIndex = pathParts.findIndex((p) => isValidAddress(p)); // since we put address before genesis in the paths
    const maybeGenesisIndex = pathParts.findIndex((p) => isValidGenesis(p));

    // Validate expected path format
    if (maybeAddressIndex === -1) {
      console.warn('Unexpected path structure:', location.pathname);

      return;
    }

    if (maybeGenesisIndex !== -1) {
      if (isStakingPath && maxPosition) {
        pathParts[maybeGenesisIndex] = maxPosition?.genesisHash;
      } else if (savedSelectedChain) {
        // Since it still can be a staking path, we need to adjust the savedSelectedChain
        const genesisHash = mapRelayToSystemGenesisIfMigrated(savedSelectedChain) ?? savedSelectedChain;

        pathParts[maybeGenesisIndex] = genesisHash;
      }
    }

    pathParts[maybeAddressIndex] = newAddress;

    let newPath = pathParts.join('/');

    if (isStakingPath && maxPositionType) {
      const opposite = maxPositionType === 'solo' ? 'pool' : 'solo';

      if (!newPath.includes(maxPositionType) && newPath.includes(opposite)) {
        newPath = newPath.replace(opposite, maxPositionType);
      }
    }

    navigate(newPath) as void;
  }, [isStakingPath, location.pathname, maxPosition, maxPositionType, navigate, savedSelectedChain]);

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
