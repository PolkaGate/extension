// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React from 'react';

import { DeriveAccountRegistration } from '@polkadot/api-derive/types';

import { useTranslation } from '../../components/translate';
import DisplayIdentityInformation from './partial/DisplayIdentityInformation';

interface Props {
  identity: DeriveAccountRegistration;
}

export default function PreviewIdentity({ identity }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Grid container item sx={{ display: 'block', maxWidth: '840px', px: '10%' }}>
      <Typography fontSize='22px' fontWeight={700} pb='25px' pt='40px'>
        {t<string>('On-chain Identity')}
      </Typography>
      <DisplayIdentityInformation identity={identity} />
    </Grid>
  );
}
