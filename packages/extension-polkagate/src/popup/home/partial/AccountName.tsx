// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, type SxProps, type Theme } from '@mui/material';
import { Eye, EyeSlash } from 'iconsax-react';
import React from 'react';

import useIsHideNumbers from '../../../hooks/useIsHideNumbers';
import ScrollingTextBox from './ScrollingTextBox';

interface Props {
  accountName: string;
  style?: SxProps<Theme>;
}

function AccountName ({ accountName, style }: Props): React.ReactElement {
  const { isHideNumbers, toggleHideNumbers } = useIsHideNumbers();

  return (
    <Grid alignItems='center' container item sx={{ columnGap: '5px', width: 'fit-content', ...style }}>
      <ScrollingTextBox
        text={accountName}
        width={210}
      />
      {isHideNumbers
        ? <EyeSlash color='#BEAAD8' onClick={toggleHideNumbers} size='20' style={{ cursor: 'pointer' }} variant='Bulk' />
        : <Eye color='#BEAAD8' onClick={toggleHideNumbers} size='20' style={{ cursor: 'pointer' }} variant='Bulk' />}
    </Grid>
  );
}

export default AccountName;
