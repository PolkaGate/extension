// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { FetchedBalance } from '../../../hooks/useAssetsBalances';

import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { Container, Grid, Typography } from '@mui/material';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { ToggleDots } from '../../../components';
import SnowFlake from '../../../components/SVG/SnowFlake';
import { usePrices, useTranslation } from '../../../hooks';
import { calcPrice } from '../../../hooks/useYouHave';
import { ColumnAmounts } from '..';

interface TokenStakingInfoProp {
  tokenDetail: FetchedBalance | undefined
}

enum STAKING_TYPE {
  SOLO,
  POOL
}

function TokenStakingInfo ({ tokenDetail }: TokenStakingInfoProp) {
  const { t } = useTranslation();
  const pricesInCurrency = usePrices();

  const [state, setState] = useState<STAKING_TYPE>();

  const stakings = useMemo(() => {
    if (!tokenDetail) {
      return undefined;
    }

    const hasPoolStake = tokenDetail.pooledBalance && !tokenDetail.pooledBalance?.isZero();
    const hasSoloStake = tokenDetail.soloTotal && !tokenDetail.soloTotal.isZero();

    return {
      hasPoolStake,
      hasSoloStake
    };
  }, [tokenDetail]);

  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);

  const isDoubleStaked = stakings?.hasPoolStake && stakings.hasPoolStake;
  const stakedAmount = (state === STAKING_TYPE.POOL ? tokenDetail?.pooledBalance : tokenDetail?.soloTotal) ?? BN_ZERO;
  const totalBalance = useMemo(() => calcPrice(priceOf(tokenDetail?.priceId ?? '0'), stakedAmount, tokenDetail?.decimal ?? 0), [priceOf, stakedAmount, tokenDetail?.decimal, tokenDetail?.priceId]);

  useEffect(() => {
    if (state === undefined && stakings) {
      setState(stakings.hasPoolStake ? STAKING_TYPE.POOL : STAKING_TYPE.SOLO);
    }
  }, [stakings, state]);

  const toggleState = useCallback(() => {
    if (isDoubleStaked) {
      setState((prevState) => prevState === STAKING_TYPE.POOL ? STAKING_TYPE.SOLO : STAKING_TYPE.POOL);
    }
  }, [isDoubleStaked]);

  if (stakings && !stakings.hasPoolStake && !stakings.hasSoloStake) {
    return null;
  }

  return (
    <Container disableGutters sx={{ background: '#2D1E4A4D', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', p: '12px', rowGap: '8px' }}>
      <Grid alignItems='center' container item onClick={toggleState} sx={{ columnGap: '4px', cursor: isDoubleStaked ? 'pointer' : 'default', width: 'fit-content' }}>
        <SnowFlake size='20' />
        <Typography color='text.secondary' variant='B-1'>
          {state === STAKING_TYPE.POOL
            ? t('Pooled Staking')
            : t('Solo Staking')
          }
        </Typography>
        {isDoubleStaked &&
          <>
            <UnfoldMoreIcon sx={{ color: state === STAKING_TYPE.POOL ? '#EAEBF1' : '#AA83DC', fontSize: '17px' }} />
            <ToggleDots active={state === STAKING_TYPE.POOL} />
          </>
        }
      </Grid>
      <Grid alignItems='center' container item sx={{ rowGap: '4px', width: 'fit-content' }}>
        <ColumnAmounts
          cryptoAmount={stakedAmount}
          decimal={tokenDetail?.decimal ?? 0}
          fiatAmount={totalBalance}
          token={tokenDetail?.token ?? ''}
        />
      </Grid>
    </Container>
  );
}

export default memo(TokenStakingInfo);
