// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
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
      <Typography color={theme.palette.mode === 'dark' ? '#AA83DC' : theme.palette.text.secondary} variant='B-2'>
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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const successColor = isDark ? '#82FFA5' : theme.palette.success.main;
  const successMutedColor = isDark ? '#82FFA580' : '#5EBE82';
  const successBgColor = isDark ? '#82FFA526' : '#DDF8EA';

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: successBgColor, borderRadius: '9px', display: 'flex', flexDirection: 'row', gap: '4px', m: 'auto', p: '2px 6px', whiteSpace: 'nowrap', width: 'fit-content' }}>
      <PercentageCircle color={successColor} size='16' variant='Bold' />
      <Grid container item sx={{ flexWrap: 'nowrap', fontSize: '14px', fontWeight: 600, gap: '3px', width: 'fit-content' }}>
        <span style={{ color: successColor }}>up</span>
        <span style={{ color: successMutedColor }}>to</span>
        <span style={{ color: successColor }}>{rate}%</span>
        <span style={{ color: successMutedColor }}>per year</span>
      </Grid>
    </Container>
  );
};

const StakeButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Grid container item onClick={onClick} sx={{ alignItems: 'center', bgcolor: theme.palette.mode === 'dark' ? '#2D1E4A' : '#EEF1FF', border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'transparent' : '#DDE3F4', borderRadius: '11px', cursor: 'pointer', flexWrap: 'nowrap', gap: '6px', justifyContent: 'center', minWidth: '77px', p: '8px', width: 'fit-content' }}>
      <Trade color={theme.palette.mode === 'dark' ? '#AA83DC' : theme.palette.primary.main} size='18' variant='Bulk' />
      <Typography color={theme.palette.mode === 'dark' ? 'primary.main' : 'text.highlight'} variant='B-4'>
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

function EarningItem({ info, popupOpener, setSelectedPosition }: Props) {
  const theme = useTheme();
  const { availableBalance, decimal, freeBalance, genesisHash, rate, tokenSymbol } = info;
  const isTestNet = useMemo(() => TEST_NETS.includes(genesisHash), [genesisHash]);

  const onStake = useCallback(() => {
    setSelectedPosition(info);

    popupOpener(StakingPopUps.STAKING_INFO)();
  }, [info, popupOpener, setSelectedPosition]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: theme.palette.mode === 'dark' ? '#05091C' : '#FFFFFF', border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'transparent' : '#EEF1FF', borderRadius: '14px', display: 'flex', flexDirection: 'row', gap: '40px', justifyContent: 'space-between', p: '4px', pl: '18px' }}>
      <TokenInfo genesisHash={genesisHash} />
      <Available balance={freeBalance || availableBalance || BN_ZERO} decimal={decimal} token={tokenSymbol} />
      <ChainIdentifier genesisHash={genesisHash} />
      <TestnetBadge style={{ mt: 0, visibility: isTestNet ? 'visible' : 'hidden' }} />
      <YieldBadge rate={rate} />
      <StakeButton onClick={onStake} />
    </Container>
  );
}

export default memo(EarningItem);
