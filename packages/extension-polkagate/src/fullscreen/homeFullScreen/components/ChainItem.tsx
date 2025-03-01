// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
import type { DropdownOption } from '../../../util/types';

import { Grid, Typography, useTheme } from '@mui/material';
import React from 'react';

import { ChainLogo, Switch } from '../../../components';

interface Props {
  onclick: (item: DropdownOption) => void;
  chain: DropdownOption;
  isSelected?: boolean;
  disabled: boolean | undefined;
}

function ChainItem({ chain, disabled, isSelected, onclick }: Props): React.ReactElement {
  const theme = useTheme();

  return (
    <Grid alignItems='center' container justifyContent='space-between' sx={{ ':hover': { bgcolor: theme.palette.mode === 'light' ? 'rgba(24, 7, 16, 0.1)' : 'rgba(255, 255, 255, 0.1)' }, cursor: 'pointer', height: '45px', opacity: disabled ? 0.3 : 1, px: '15px' }}>
      <Grid
        alignItems='center'
        sx={{
          display: 'flex',
          flexGrow: 1,
          minWidth: 0,
          mr: '10px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
        xs={9}
      >
        <ChainLogo chainName={chain.text} genesisHash={chain.value as string} size={25} />
        <Typography
          fontSize='16px' fontWeight={isSelected ? 500 : 400}
          sx={{
            minWidth: 0,
            ml: '10px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {chain.text}
        </Typography>
      </Grid>
      <Grid container item xs={2}>
        <Switch
          fontSize='17px'
          isChecked={isSelected && !disabled}
          // eslint-disable-next-line react/jsx-no-bind
          onChange={() => onclick(chain)}
          theme={theme}
        />
      </Grid>
    </Grid>
  );
}

export default React.memo(ChainItem);
