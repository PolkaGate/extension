// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Avatar, Grid, SxProps, Theme, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useAccount, useChainName } from '@polkadot/extension-polkagate/src/hooks';
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
  const [isTestnetEnabled, setIsTestnetEnabled] = useState<boolean>();
  const previousGenesisHash = useAccount(address)?.genesisHash;
  const _disabledItems = useMemo((): (string | number)[] | undefined => {
    if (disabledItems && !isTestnetEnabled) {
      return disabledItems.concat(TEST_NETS) as (string | number)[];
    }

    if (!isTestnetEnabled) {
      return TEST_NETS;
    }

    return disabledItems;
  }, [disabledItems, isTestnetEnabled]);

  useEffect(() =>
    setIsTestnetEnabled(window.localStorage.getItem('testnet_enabled') === 'true')
    , []);

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
            accountsAndChains[address] = [currentGenesisHash, ...INITIAL_RECENT_CHAINS_GENESISHASH];
          }

          // eslint-disable-next-line no-void
          void chrome.storage.local.set({ RecentChains: accountsAndChains });
        } else if (myRecentChains && !(myRecentChains.includes(currentGenesisHash))) {
          myRecentChains.pop();
          myRecentChains.unshift(currentGenesisHash);
          accountsAndChains[address] = myRecentChains;

          // eslint-disable-next-line no-void
          void chrome.storage.local.set({ RecentChains: accountsAndChains });
        } else if (myRecentChains && myRecentChains.includes(currentGenesisHash)) {
          const newlist = myRecentChains.filter((chain) => previousGenesisHash ? chain !== previousGenesisHash : true).unshift(currentGenesisHash);

          accountsAndChains[address] = newlist;

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
      <Grid item xs={10.5}>
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
      <Grid item pl={1} xs={1.5}>
        {icon
          ? <Avatar src={icon} sx={{ filter: (CHAINS_WITH_BLACK_LOGO.includes(currentChainName) && theme.palette.mode === 'dark') ? 'invert(1)' : '', borderRadius: '50%', height: 31, width: 31 }} variant='square' />
          : <Grid sx={{ bgcolor: 'action.disabledBackground', border: '1px solid', borderColor: 'secondary.light', borderRadius: '50%', height: '31px', width: '31px' }}>
          </Grid>
        }
      </Grid>
    </Grid>
  );
}

export default React.memo(SelectChain);
