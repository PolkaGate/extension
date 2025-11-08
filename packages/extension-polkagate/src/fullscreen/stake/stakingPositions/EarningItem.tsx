// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PositionInfo } from '../../../util/types';

import { Container, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import { PercentageCircle, Trade } from 'iconsax-react';
import React, { memo, useCallback, useMemo } from 'react';

import { type BN, BN_ZERO } from '@polkadot/util';

import { DisplayBalance } from '../../../components';
import { useTranslation } from '../../../hooks';
import { TestnetBadge } from '../../../popup/staking/StakingPositions';
import { TEST_NETS } from '../../../util/constants';
import { type PopupOpener, StakingPopUps } from '../util/utils';
import { ChainIdentifier, TokenInfo } from './PositionItem';

interface StakedProps {
  balance: BN;
  decimal: number;
  token: string;
}

const Available = ({ balance, decimal, token }: StakedProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Grid container item sx={{ alignItems: 'center', gap: '6px', justifyContent: 'flex-start', minWidth: '160px', width: 'fit-content' }}>
      <Typography color='#AA83DC' variant='B-2'>
        {t('Available')}:
      </Typography>
      {balance === undefined
        ? (
          <Skeleton
            animation='wave'
            height='16px'
            sx={{ borderRadius: '10px', fontWeight: 'bold', maxWidth: '75px', transform: 'none', width: '100%' }}
            variant='text'
          />)
        : (
          <DisplayBalance
            balance={balance}
            decimal={decimal}
            style={{
              borderRadius: '9px',
              color: theme.palette.text.secondary,
              fontFamily: 'Inter',
              fontSize: '14px',
              fontWeight: 600,
              width: 'max-content'
            }}
            token={token}
          />)}
    </Grid>
  );
};

const YieldBadge = ({ rate }: { rate: number | undefined }) => {
  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#82FFA526', borderRadius: '9px', display: 'flex', flexDirection: 'row', gap: '4px', m: 'auto', p: '2px 6px', whiteSpace: 'nowrap', width: 'fit-content' }}>
      <PercentageCircle color='#82FFA5' size='16' variant='Bold' />
      <Grid container item sx={{ flexWrap: 'nowrap', fontSize: '14px', fontWeight: 600, gap: '3px', width: 'fit-content' }}>
        <span style={{ color: '#82FFA5' }}>up</span>
        <span style={{ color: '#82FFA580' }}>to</span>
        <span style={{ color: '#82FFA5' }}>{rate}%</span>
        <span style={{ color: '#82FFA580' }}>per year</span>
      </Grid>
    </Container>
  );
};

const StakeButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();

  return (
    <Grid container item onClick={onClick} sx={{ alignItems: 'center', bgcolor: '#2D1E4A', borderRadius: '11px', cursor: 'pointer', flexWrap: 'nowrap', gap: '6px', justifyContent: 'center', minWidth: '77px', p: '8px', width: 'fit-content' }}>
      <Trade color='#AA83DC' size='18' variant='Bulk' />
      <Typography color='primary.main' variant='B-4'>
        {t('Stake')}
      </Typography>
    </Grid>
  );
};

interface Props {
  info: PositionInfo
  popupOpener: PopupOpener;
  setSelectedPosition: React.Dispatch<React.SetStateAction<PositionInfo | undefined>>;
}

function EarningItem ({ info, popupOpener, setSelectedPosition }: Props) {
  const { availableBalance, decimal, freeBalance, genesisHash, rate, token } = info;
  const isTestNet = useMemo(() => TEST_NETS.includes(genesisHash), [genesisHash]);

  const onStake = useCallback(() => {
    setSelectedPosition(info);

    popupOpener(StakingPopUps.STAKING_INFO)();
  }, [info, popupOpener, setSelectedPosition]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '14px', display: 'flex', flexDirection: 'row', gap: '40px', justifyContent: 'space-between', p: '4px', pl: '18px' }}>
      <TokenInfo genesisHash={genesisHash} />
      <Available balance={freeBalance || availableBalance || BN_ZERO} decimal={decimal} token={token} />
      <ChainIdentifier genesisHash={genesisHash} />
      <TestnetBadge style={{ mt: 0, visibility: isTestNet ? 'visible' : 'hidden' }} />
      <YieldBadge rate={rate} />
      <StakeButton onClick={onStake} />
    </Container>
  );
}

export default memo(EarningItem);
