// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, SxProps, Theme, Typography } from '@mui/material';
import React from 'react';

import { useFormatted, useTranslation } from '../hooks';
import { Identity, ShortAddress } from '.';

interface Props {
  address: string;
  style?: SxProps<Theme> | undefined;
}

function AccountHolder({ address, style }: Props): React.ReactElement {
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
        identiconSize={31}
        style={{
          minWidth: '35%',
          maxWidth: '100%',
          width: 'fit-content'
        }}
      />
      <ShortAddress address={formatted} />
    </Grid>
  );
}

export default React.memo(AccountHolder);