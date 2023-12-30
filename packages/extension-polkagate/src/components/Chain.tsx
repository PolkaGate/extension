// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, SxProps, Theme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useGenesisHashOptions, useIsTestnetEnabled } from '@polkadot/extension-polkagate/src/hooks';
import { TEST_NETS } from '@polkadot/extension-polkagate/src/util/constants';

import { INITIAL_RECENT_CHAINS_GENESISHASH } from '../util/constants';
import Select2 from './Select2';

interface Props {
  address: string | null | undefined;
  defaultValue?: string | undefined;
  onChange: (value: string) => void;
  label: string;
  style: SxProps<Theme> | undefined;
  disabledItems?: string[] | number[];
}

function Chain ({ address, defaultValue, disabledItems, label, onChange, style }: Props) {
  let options = useGenesisHashOptions();
  const isTestnetEnabled = useIsTestnetEnabled();

  options = options.filter(({ text }) => text !== 'Allow use on any chain');

  const _disabledItems = useMemo((): (string | number)[] | undefined =>
    !isTestnetEnabled
      ? [...(disabledItems || []), ...TEST_NETS]
      : disabledItems
  , [disabledItems, isTestnetEnabled]);

  const onChangeNetwork = useCallback((newGenesisHash: string) => {
    try {
      onChange(newGenesisHash);

      const currentGenesisHash = newGenesisHash.startsWith('0x') ? newGenesisHash : undefined;

      if (!address || !currentGenesisHash) {
        return;
      }

      chrome.storage.local.get('RecentChains', (res) => {
        const accountsAndChains = res?.RecentChains ?? {};
        let myRecentChains = accountsAndChains[address] as string[];

        if (!myRecentChains) {
          if (INITIAL_RECENT_CHAINS_GENESISHASH.includes(currentGenesisHash)) {
            accountsAndChains[address] = INITIAL_RECENT_CHAINS_GENESISHASH;
          } else {
            INITIAL_RECENT_CHAINS_GENESISHASH.length = 3;
            accountsAndChains[address] = [...INITIAL_RECENT_CHAINS_GENESISHASH, currentGenesisHash];
          }

          // eslint-disable-next-line no-void
          void chrome.storage.local.set({ RecentChains: accountsAndChains });
        } else if (myRecentChains && !(myRecentChains.includes(currentGenesisHash))) {
          myRecentChains.unshift(currentGenesisHash);
          myRecentChains.pop();
          accountsAndChains[address] = myRecentChains;

          // eslint-disable-next-line no-void
          void chrome.storage.local.set({ RecentChains: accountsAndChains });
        }
      });
    } catch (error) {
      console.error(error);
    }
  }, [address, onChange]);

  return (
    <Grid alignItems='flex-end' container justifyContent='space-between' sx={{ ...style }}>
      <Select2
        defaultValue={defaultValue}
        disabledItems={_disabledItems}
        isDisabled={!address}
        label={label}
        onChange={onChangeNetwork}
        options={options}
        showLogo
      />
    </Grid>
  );
}

export default React.memo(Chain);
