// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { PositionInfo } from '../../../util/types';

import { Box, Grid, Stack, Typography } from '@mui/material';
import { Clock, Medal, WalletMoney } from 'iconsax-react';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { BN_ZERO } from '@polkadot/util';

import { info, money } from '../../../assets/gif';
import { FormatBalance2, GradientButton } from '../../../components';
import { useIsExtensionPopup, usePoolConst, useStakingConsts, useTranslation } from '../../../hooks';
import { SharePopup } from '../../../partials';
import { RedGradient } from '../../../style';
import { remainingTime } from '../../../util/time';
import { amountToHuman } from '../../../util/utils';
import InfoRow from './InfoRow';
import Title from './Title';

interface Props {
  setSelectedPosition: React.Dispatch<React.SetStateAction<PositionInfo | undefined>>;
  selectedPosition: PositionInfo | undefined;
  onNext?: () => void;
  onClose?: () => void;
}

function AvailableBalance ({ availableBalance, decimal, isExtension, token }: { availableBalance: BN, decimal: number, isExtension: boolean, token: string }): React.ReactElement {
  return (
    <Box sx={{ alignContent: 'center', bgcolor: '#BFA1FF26', borderRadius: '12px', height: '32px', margin: isExtension ? 0 : '20px auto 0', position: isExtension ? 'absolute' : 'initial', px: '10px', right: '15px', width: 'fit-content' }}>
      <Typography color='#BEAAD8' variant='B-2'>
        <FormatBalance2
          decimalPoint={2}
          decimals={[decimal]}
          tokens={[token]}
          value={availableBalance}
        />
      </Typography>
    </Box>
  );
}

function StakingInfo ({ onClose, onNext, selectedPosition, setSelectedPosition }: Props): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();
  const navigate = useNavigate();
  const poolConsts = usePoolConst(selectedPosition?.genesisHash);
  const stakingConsts = useStakingConsts(selectedPosition?.genesisHash);

  const _decimal = selectedPosition?.decimal || stakingConsts?.decimal || 1;
  const eraLength = remainingTime(poolConsts?.eraLength?.toNumber() ?? 0);

  const handleClose = useCallback(() => onClose ? onClose() : setSelectedPosition(undefined), [onClose, setSelectedPosition]);
  const goStaking = useCallback(() => onNext ? onNext() : navigate('/easyStake/' + selectedPosition?.genesisHash) as void, [navigate, onNext, selectedPosition?.genesisHash]);

  const min = `${amountToHuman(poolConsts?.minJoinBond || stakingConsts?.minNominatorBond, _decimal)} ${selectedPosition?.tokenSymbol}`;

  return (
    <SharePopup
      modalProps={{ noDivider: true, showBackIconAsClose: true }}
      onClose={handleClose}
      open
      popupProps={{
        maxHeight: '505px',
        openMenu: !!selectedPosition,
        px: 0,
        style: { position: 'relative' },
        withoutTopBorder: true
      }}
    >
      <Stack direction='column' sx={{ p: '10px 10px 0', position: 'relative', width: '100%', zIndex: 1 }}>
        <RedGradient style={{ right: '-3%', visibility: isExtension ? 'visible' : 'hidden' }} />
        {isExtension &&
          <AvailableBalance
            availableBalance={selectedPosition?.freeBalance || selectedPosition?.availableBalance || BN_ZERO}
            decimal={_decimal}
            isExtension={true}
            token={selectedPosition?.tokenSymbol ?? ''}
          />}
        <Grid alignItems='center' columnGap='10px' container direction='column' item justifyContent={'center'}>
          <Box
            component='img'
            src={info as string}
            sx={{ height: '100px', width: '100px', zIndex: 2 }}
          />
          <Box
            component='img'
            src={money as string}
            sx={{ height: '128px', position: 'absolute', top: '10px', width: '128px' }}
          />
          <Title
            selectedPosition={selectedPosition}
          />
        </Grid>
        {!isExtension &&
          <AvailableBalance
            availableBalance={selectedPosition?.freeBalance || selectedPosition?.availableBalance || BN_ZERO}
            decimal={_decimal}
            isExtension={false}
            token={selectedPosition?.tokenSymbol ?? ''}
          />}
        <Stack direction='column' sx={{ height: '255px', mt: '15px', overflow: 'auto', position: 'relative', rowGap: isExtension ? '15px' : '20px', width: '100%' }}>
          {(poolConsts?.minJoinBond || stakingConsts?.minNominatorBond) &&
            <InfoRow
              Icon={WalletMoney}
              text={t('Stake anytime with as little as {{min}} and start earning rewards actively within {{eraLength}}', { replace: { eraLength, min } })}
              textPartInColor={min}
            />}
          <InfoRow
            Icon={Clock}
            text={t('Unstake anytime, and redeem your funds after {{duration}} days. No rewards will be earned during that period', { replace: { duration: stakingConsts?.unbondingDuration } })}
            textPartInColor={t('after {{unbonding}} days.', { replace: { unbonding: stakingConsts?.unbondingDuration } })}
          />
          <InfoRow
            Icon={Medal}
            text={t('Rewards accumulate every {{duration}} hours. Rewards require manual claiming if you have staked in pools.', { replace: { duration: stakingConsts?.eraDuration } })}
            textPartInColor={t('{{duration}} hours', { replace: { duration: stakingConsts?.eraDuration } })}
          />
        </Stack>
        <GradientButton
          contentPlacement='center'
          disabled={false}
          onClick={goStaking}
          style={{
            height: '44px',
            marginTop: '15px',
            width: '100%'
          }}
          text={t('Start staking')}
        />
      </Stack>
    </SharePopup>
  );
}

export default StakingInfo;
