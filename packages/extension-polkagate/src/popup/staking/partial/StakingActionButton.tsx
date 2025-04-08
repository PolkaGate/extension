// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Grid, Typography } from '@mui/material';
import React from 'react';

import { noop } from '@polkadot/util';

interface Props {
  text: string;
  Icon: Icon;
  onClick: () => void;
  disabled?: boolean;
}

export default function StakingActionButton ({ Icon, disabled = false, onClick, text }: Props): React.ReactElement {
  return (
    <Grid alignItems='center' container item onClick={disabled ? noop : onClick} sx={{ ':hover': { bgcolor: '#809ACB40', borderColor: 'transparent' }, border: '1px solid', borderColor: '#809ACB40', borderRadius: '12px', columnGap: '5px', cursor: disabled ? 'default' : 'pointer', p: '4px 7px', transition: 'all 150ms ease-out', width: 'fit-content' }}>
      <Icon color='#809ACB' size='19' variant='Bulk' />
      <Typography color='text.highlight' variant='B-2'>
        {text}
      </Typography>
    </Grid>
  );
}
