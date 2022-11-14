// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this component opens join pool review page
 * */

import { Grid, SxProps, Theme, Typography } from '@mui/material';
import React from 'react';

import { useFormatted, useTranslation } from '../hooks';
import { Identity, ShortAddress } from '.';

interface Props {
  address: string;
  style?: SxProps<Theme> | undefined;
}

export default function AccountHolder({ address, style }: Props): React.ReactElement {
  const { t } = useTranslation();
  const formatted = useFormatted(address);

  return (
    <Grid
      alignItems='center'
      container
      direction='column'
      justifyContent='center'
      sx={style}
    >
      <Typography
        fontSize='16px'
        fontWeight={300}
        textAlign='center'
      >
        {t<string>('Account holder')}
      </Typography>
      <Identity
        address={address}
        style={{
          minWidth: '35%',
          width: 'fit-content'
        }}
      />
      <ShortAddress address={formatted} />
    </Grid>
  );
}
