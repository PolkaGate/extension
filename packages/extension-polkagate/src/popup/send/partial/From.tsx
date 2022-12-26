// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component shows ..
 * */

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Balance } from '@polkadot/types/interfaces';

import { Grid, SxProps, Theme, useTheme } from '@mui/material';
import React from 'react';

import { BN } from '@polkadot/util';

import { ChainLogo, Identity, ShortAddress } from '../../../components';
import { useChain, useFormatted, useTranslation } from '../../../hooks';
import BalanceFee from './BalanceFee';

interface Props {
  address?: string;
  api: ApiPromise | undefined;
  judgement?: any;
  name: string | undefined;
  style?: SxProps<Theme> | undefined;
}

function From({ address, api, judgement, name }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();
  const formatted = useFormatted(address);
  const chain = useChain(address);

  return (
    <>
      <div style={{ fontSize: '16px', fontWeight: 300 }}>
        {t('From')}
      </div>
      <Grid alignItems='center' container justifyContent='felx-start' sx={{ border: 1, borderColor: 'primary.main', borderRadius: '5px', background: `${theme.palette.background.paper}`, py: '5px', mt: '2px' }}>
        <Grid item sx={{ fontSize: '28px', fontWeight: 400, mx: '5px', maxWidth: '67%' }}>
          <Identity address={address} api={api} chain={chain} judgement={judgement} identiconSize={31} name={name} showSocial={false} />
        </Grid>
        <Grid item sx={{ width: '29%' }}>
          <ShortAddress address={formatted} style={{ fontSize: '16px', fontWeight: 300, justifyContent: 'flex-start', mt: '5px', pr: '5px' }} />
        </Grid>
      </Grid>
    </>
  );
}

export default React.memo(From);
