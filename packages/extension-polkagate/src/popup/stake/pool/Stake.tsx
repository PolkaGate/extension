// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import { Grid, Typography } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useLocation } from 'react-router-dom';

import { ApiPromise } from '@polkadot/api';

import { useApi, useBalances, useFormatted, usePool, usePoolConsts, useTranslation } from '../../../hooks';
import { HeaderBrand } from '../../../partials';
import { MyPoolInfo, PoolStakingConsts } from '../../../util/types';
import BondExtra from './bondExtra/BondExtra';
import StakeInitialChoice from './StakeInitialChoice';

interface State {
  api?: ApiPromise;
  consts?: PoolStakingConsts;
  pool: MyPoolInfo | null | undefined;
  balances: DeriveBalancesAll | undefined;
  pathname: string;
}

export default function Stake(): React.ReactElement {
  const { t } = useTranslation();
  const { address } = useParams<{ address: string }>();
  const formatted = useFormatted(address);
  const { state } = useLocation<State>();
  const api = useApi(address, state?.api);
  const poolStakingConsts = usePoolConsts(address, state?.consts);
  const balances = state?.balances ?? useBalances(address);

  const [notStaked, setNotStaked] = useState<boolean | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [myPool, setMyPool] = useState<MyPoolInfo | null>();

  const fetchMyPool = usePool(address, undefined, state?.pool);

  useEffect(() => {
    fetchMyPool !== undefined && setMyPool(fetchMyPool);
  }, [fetchMyPool]);

  useEffect(() => {
    if (myPool === undefined) {
      return;
    }

    setNotStaked(myPool === null);
    setNotStaked(!myPool);
    setLoading(false);
  }, [myPool]);

  return (
    <>
      {loading &&
        <>
          <HeaderBrand
            shortBorder
            text={t<string>('Pool Staking')}
          />
          <Typography
            fontSize='22px'
            fontWeight={300}
            m='25px auto 60px'
            textAlign='center'
            width='60%'
          >
            {t<string>('We are pulling some information.')}
          </Typography>
          <Grid
            alignItems='center'
            container
            justifyContent='center'
          >
            <Circle color='#99004F' scaleEnd={0.7} scaleStart={0.4} size={125} />
          </Grid>
          <Typography
            fontSize='18px'
            fontWeight={300}
            m='60px auto 0'
            textAlign='center'
            width='80%'
          >
            {t<string>('Please wait a few seconds and don’t close the extension.')}
          </Typography>
        </>
      }
      {notStaked && !loading &&
        <StakeInitialChoice address={address} api={api} balances={balances} consts={poolStakingConsts} />
      }
      {!notStaked && !loading &&
        <BondExtra address={address} api={api} balances={balances} formatted={formatted} myPool={myPool} />
      }
    </>
  );
}
