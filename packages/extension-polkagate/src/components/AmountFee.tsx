// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { Divider, Grid, SxProps, Theme } from '@mui/material';
import React from 'react';

import { useAccount, useTranslation } from '../hooks';
import { TOTAL_STAKE_HELPER_TEXT } from '../util/constants';
import { ChainLogo, Infotip, ShowValue } from '.';

interface Props {
  address: string;
  amount: string | React.ReactNode;
  children?: React.ReactNode;
  label: string;
  fee?: Balance | undefined;
  style?: SxProps<Theme> | undefined;
  token?: string;
  showDivider?: boolean;
  withFee?: boolean;
}

function AmountFee({ address, amount, children, fee, label, style = {}, showDivider = false, token, withFee }: Props): React.ReactElement {
  const { t } = useTranslation();
  const account = useAccount(address);

  return (
    <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ fontWeight: 300, letterSpacing: '-0.015em', ...style }}>
      {label.includes(t('Total stake'))
        ? <Infotip iconLeft={5} iconTop={5} showQuestionMark text={t(TOTAL_STAKE_HELPER_TEXT)}>
          <Grid item sx={{ fontSize: '16px' }}>
            {label}
          </Grid>
        </Infotip>
        : <Grid item sx={{ fontSize: '16px' }}>
          {label}
        </Grid>
      }
      <Grid alignItems='center' container item justifyContent='center' sx={{ lineHeight: '28px' }}>
        <Grid alignItems='center' container item justifyContent='center' sx={{ fontSize: '28px', fontWeight: 400 }}>
          <Grid item>
            <ChainLogo genesisHash={account?.genesisHash} size={31} />
          </Grid>
          <Grid item sx={{ fontSize: '26px', ml: '5px' }}>
            {amount} {token}
          </Grid>
        </Grid>
        {withFee &&
          <Grid alignItems='center' container item justifyContent='center' lineHeight='20px'>
            <Grid item>
              {t('Fee')}:
            </Grid>
            <Grid item sx={{ pl: '5px' }}>
              <ShowValue value={fee?.toHuman()} height={16} />
            </Grid>
          </Grid>
        }
      </Grid>
      {children}
      {showDivider &&
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '5px', width: '240px' }} />
      }
    </Grid>
  );
}

export default React.memo(AmountFee);