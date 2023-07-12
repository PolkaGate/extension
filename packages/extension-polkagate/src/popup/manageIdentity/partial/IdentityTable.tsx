// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, SxProps, Theme, Typography } from '@mui/material';
import React from 'react';

import { DeriveAccountRegistration } from '@polkadot/api-derive/types';

import { useTranslation } from '../../../hooks';

interface Props {
  identity: DeriveAccountRegistration;
  style?: SxProps<Theme> | undefined;
  maxHeight?: string;
}

export default function IdentityTable ({ identity, maxHeight = '285px', style }: Props): React.ReactElement {
  const { t } = useTranslation();

  const IdItems = ({ noBorder = false, title, value }: { title: string, value: string | undefined, noBorder?: boolean }) => (
    <Grid alignItems='center' container height='35px' item sx={noBorder ? {} : { borderBottom: '1px solid', borderBottomColor: 'rgba(0,0,0,0.2)' }}>
      <Grid alignItems='center' container item sx={{ borderRight: '1px solid', borderRightColor: 'rgba(0,0,0,0.2)', height: '100%' }} xs={4}>
        <Typography fontSize='16px' fontWeight={400} pl='12px'>
          {title}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item xs={8}>
        <Typography fontSize='20px' fontWeight={400} maxWidth='100%' overflow='hidden' pl='12px' textOverflow='ellipsis' whiteSpace='nowrap'>
          {value && value.length >= 1 ? value : t<string>('None')}
        </Typography>
      </Grid>
    </Grid>
  );

  return (
    <Grid container item sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', display: 'block', height: 'fit-content', maxHeight, ...style }}>
      <IdItems
        title={t<string>('Display Name')}
        value={identity.display}
      />
      <IdItems
        title={t<string>('Legal Name')}
        value={identity.legal}
      />
      <IdItems
        title={t<string>('Email')}
        value={identity.email}
      />
      <IdItems
        title={t<string>('Website')}
        value={identity.web}
      />
      <IdItems
        title={t<string>('Twitter')}
        value={identity.twitter}
      />
      <IdItems
        title={t<string>('Element')}
        value={identity.riot}
      />
      <IdItems
        noBorder
        title={t<string>('Discord')}
        value={identity.other?.discord}
      />
    </Grid>
  );
}
