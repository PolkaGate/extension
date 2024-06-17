// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, type SxProps, type Theme, Typography } from '@mui/material';
import React from 'react';

import { DeriveAccountRegistration } from '@polkadot/api-derive/types';

import { useTranslation } from '../../../hooks';

interface Props {
  identity: DeriveAccountRegistration;
  style?: SxProps<Theme> | undefined;
}

export default function IdentityTable({ identity, style }: Props): React.ReactElement {
  const { t } = useTranslation();

  const IdItems = ({ noBorder = false, title, value }: { title: string, value: string | undefined, noBorder?: boolean }) => (
    <>
      {value && value.length >= 1 &&
        <Grid alignItems='center' container height='35px' item sx={noBorder ? {} : { borderBottom: '1px solid', borderBottomColor: 'divider' }}>
          <Grid alignItems='center' container item sx={{ borderRight: '1px solid', borderRightColor: 'divider', height: '100%' }} xs={4}>
            <Typography fontSize='16px' fontWeight={400} pl='12px'>
              {title}
            </Typography>
          </Grid>
          <Grid alignItems='center' container item xs={8}>
            <Typography fontSize='20px' fontWeight={400} maxWidth='100%' overflow='hidden' pl='12px' textOverflow='ellipsis' whiteSpace='nowrap'>
              {value}
            </Typography>
          </Grid>
        </Grid>
      }
    </>
  );

  return (
    <Grid container item sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', display: 'block', height: 'fit-content', ...style }}>
      <IdItems
        title={t('Display Name')}
        value={identity.display}
      />
      <IdItems
        title={t('Legal Name')}
        value={identity.legal}
      />
      <IdItems
        title={t('Email')}
        value={identity.email}
      />
      <IdItems
        title={t('Website')}
        value={identity.web}
      />
      <IdItems
        title={t('X')}
        value={identity.twitter}
      />
      <IdItems
        title={t('Element')}
        value={identity.matrix || identity.riot}
      />
      <IdItems
        title={t('Github')}
        value={identity.github}
      />
      <IdItems
        noBorder
        title={t('Discord')}
        value={identity.discord || identity.other?.discord}
      />
    </Grid>
  );
}
