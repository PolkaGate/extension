// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Grid, SxProps, Theme, useTheme } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { useChainName, useIsTestnetEnabled } from '@polkadot/extension-polkagate/src/hooks';
import { CHAINS_WITH_BLACK_LOGO, TEST_NETS } from '@polkadot/extension-polkagate/src/util/constants';

import { INITIAL_RECENT_CHAINS_GENESISHASH } from '../util/constants';
import Select from './Select';

interface DropdownOption {
  text: string;
  value: string;
}

interface Props {
  address: string | null | undefined;
  defaultValue?: string | undefined;
  onChange: (value: string) => void;
  options: DropdownOption[];
  label: string;
  icon?: string;
  style: SxProps<Theme> | undefined;
  disabledItems?: string[] | number[];
}

function SelectChain({ address, defaultValue, disabledItems, icon = undefined, label, onChange, options, style }: Props) {
  const currentChainName = useChainName(address !== 'dummy' ? address : undefined);
  const theme = useTheme();
  const isTestnetEnabled = useIsTestnetEnabled();

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
    <Grid alignItems='flex-end' container justifyContent='space-between' pt={1} sx={{ ...style }}>
      <Grid item xs>
        <Select
          defaultValue={defaultValue}
          disabledItems={_disabledItems}
          isDisabled={!address}
          label={label}
          onChange={onChangeNetwork}
          options={options}
          showLogo
        />
      </Grid>
      <Grid item sx={{ ml: '10px', width: 'fit-content' }}>
        {icon
          ? <Avatar src={icon} sx={{ filter: (CHAINS_WITH_BLACK_LOGO.includes(currentChainName) && theme.palette.mode === 'dark') ? 'invert(1)' : '', borderRadius: '50%', height: 31, width: 31 }} variant='square' />
          : <Grid sx={{ bgcolor: 'divider', border: '1px solid', borderColor: 'secondary.light', borderRadius: '50%', height: '31px', width: '31px' }}>
            <FontAwesomeIcon
              color={theme.palette.secondary.light}
              fontSize='22px'
              icon={faQuestion}
              style={{ paddingLeft: '8px', paddingTop: '4px' }}
            />
          </Grid>
        }
      </Grid>
    </Grid>
  );
}

export default React.memo(SelectChain);
