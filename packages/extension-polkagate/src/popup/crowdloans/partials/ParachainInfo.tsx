// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { ApiPromise } from '@polkadot/api';
import { LinkOption } from '@polkadot/apps-config/endpoints/types';
import { Chain } from '@polkadot/extension-chains/types';

import { SlidePopUp } from '../../../components';
import { useTranslation } from '../../../hooks';
import { Crowdloan } from '../../../util/types';
import ShowCrowdloan from './ShowCrowdloans';

interface Props {
  api?: ApiPromise;
  chain: Chain;
  crowdloan: Crowdloan;
  crowdloansId?: LinkOption[];
  showParachainInfo: boolean;
  currentBlockNumber?: number;
  decimal?: number;
  myContribution?: string | Balance;
  token?: string;
  setShowParachainInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ParachainInfo({ api, chain, crowdloan, crowdloansId, currentBlockNumber, decimal, myContribution, setShowParachainInfo, showParachainInfo, token }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const _closeMenu = useCallback(
    () => setShowParachainInfo(false),
    [setShowParachainInfo]
  );

  const page = (
    <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item mt='46px' sx={{ borderRadius: '10px 10px 0px 0px', height: 'parent.innerHeight' }} width='100%'>
      <Grid container justifyContent='center' my='20px'>
        <Typography fontSize='28px' fontWeight={400} lineHeight={1.4}>
          {t<string>('Parachain Info')}
        </Typography>
      </Grid>
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: 'auto', width: '240px' }} />
      <Grid container item m='15px auto 0' width='92%'>
        <ShowCrowdloan
          api={api}
          chain={chain}
          crowdloan={crowdloan}
          crowdloansId={crowdloansId}
          currentBlockNumber={currentBlockNumber}
          decimal={decimal}
          myContribution={myContribution}
          token={token}
        />
      </Grid>
      <IconButton
        onClick={_closeMenu}
        sx={{
          left: '15px',
          p: 0,
          position: 'absolute',
          top: '65px'
        }}
      >
        <CloseIcon sx={{ color: 'text.primary', fontSize: 35 }} />
      </IconButton>
    </Grid>
  );

  return (
    <SlidePopUp show={showParachainInfo}>
      {page}
    </SlidePopUp>
  );
}
