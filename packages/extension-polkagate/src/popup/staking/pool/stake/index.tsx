// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useCallback } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { ApiPromise } from '@polkadot/api';

import { useApi, useBalances, useFormatted, usePool, usePoolConsts, useTranslation } from '../../../../hooks';
import { HeaderBrand } from '../../../../partials';
import { MyPoolInfo, PoolStakingConsts } from '../../../../util/types';
import BondExtra from './bondExtra';
import StakeInitialChoice from './StakeInitialChoice';

interface State {
  api?: ApiPromise;
  consts?: PoolStakingConsts;
  pool: MyPoolInfo | null | undefined;
  pathname: string;
}

export default function Stake(): React.ReactElement {
  const { t } = useTranslation();
  const { address } = useParams<{ address: string }>();
  const formatted = useFormatted(address);
  const { state } = useLocation<State>();
  const api = useApi(address, state?.api);
  const poolStakingConsts = usePoolConsts(address, state?.consts);
  const balances = useBalances(address);
  const pool = usePool(address);
  const history = useHistory();

  const onBackClick = useCallback(() => {
    history.push({
      pathname: `/pool/${address}`,
      state: { ...state }
    });
  }, [address, history, state]);

  return (
    <>
      {pool === undefined &&
        <>
          <HeaderBrand
            onBackClick={onBackClick}
            shortBorder
            showBackArrow
            showClose
            text={t<string>('Pool Staking')}
          />
          <Typography fontSize='22px' fontWeight={300} m='25px auto 60px' textAlign='center' width='60%'>
            {t<string>('We are pulling some information.')}
          </Typography>
          <Grid alignItems='center' container justifyContent='center'>
            <Circle color='#99004F' scaleEnd={0.7} scaleStart={0.4} size={125} />
          </Grid>
          <Typography fontSize='18px' fontWeight={300} m='60px auto 0' textAlign='center' width='80%'>
            {t<string>('Please wait a few seconds and don’t close the extension.')}
          </Typography>
        </>
      }
      {pool === null &&
        <StakeInitialChoice address={address} api={api} balances={balances} consts={poolStakingConsts} />
      }
      {pool &&
        <BondExtra address={address} api={api} balances={balances} formatted={formatted} pool={pool} />
      }
    </>
  );
}
