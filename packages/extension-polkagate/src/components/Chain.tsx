// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, type SxProps, type Theme } from '@mui/material';
import React, { useCallback, useContext, useMemo } from 'react';

import { useIsTestnetEnabled } from '@polkadot/extension-polkagate/src/hooks';
import { TEST_NETS } from '@polkadot/extension-polkagate/src/util/constants';

import { updateRecentChains } from '../util/utils';
import { GenesisHashOptionsContext } from './contexts';
import Select2 from './Select2';

interface Props {
  address: string | null | undefined;
  allowAnyChainOption?: boolean;
  defaultValue?: string | undefined;
  onChange: (value: string) => void;
  label: string;
  style: SxProps<Theme> | undefined;
  disabledItems?: string[] | number[];
}

function Chain({ address, allowAnyChainOption, defaultValue, disabledItems, label, onChange, style }: Props) {
  let options = useContext(GenesisHashOptionsContext);
  const isTestnetEnabled = useIsTestnetEnabled();

  options = allowAnyChainOption ? options : options.filter(({ text }) => text !== 'Allow use on any chain');

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

      updateRecentChains(address, currentGenesisHash).catch(console.error);
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
        // @ts-ignore
        onChange={onChangeNetwork}
        options={options}
        showLogo
      />
    </Grid>
  );
}

export default React.memo(Chain);
