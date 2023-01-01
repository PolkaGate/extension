// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens stake review page
 * */

import { Grid, Typography } from '@mui/material';
import React from 'react';

import { ShortAddress } from '../../../../../components';
import { useAccountName, useMyAccountIdentity, useTranslation } from '../../../../../hooks';
import { SoloSettings } from '../../../../../util/types';
import getPayee from './util';

interface Props {
  settings: SoloSettings
}

export default function RewardsDestination({ settings }: Props): React.ReactElement {
  const { t } = useTranslation();
  const address = getPayee(settings);
  const payeeName = useAccountName(address)
  const payeeIdentity = useMyAccountIdentity(address);

  return (
    <Grid container item justifyContent='center' sx={{ alignSelf: 'center' }}>
      <Typography sx={{ fontWeight: 300 }}>
        {t('Rewards destination')}
      </Typography>
      <Grid container item justifyContent='center' mt='5px'>
        {settings.payee === 'Staked'
          ? <Typography sx={{ fontWeight: 400 }}>
            {t('Add to staked amount')}
          </Typography>
          : <Grid container item justifyContent='center'>
            <Grid item sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: 'fit-content', maxWidth: '60%' }}>
              {payeeIdentity?.display || payeeName}
            </Grid>
            <Grid item>
              <ShortAddress address={address} inParentheses />
            </Grid>
          </Grid>
        }
      </Grid>
    </Grid>
  );
}
