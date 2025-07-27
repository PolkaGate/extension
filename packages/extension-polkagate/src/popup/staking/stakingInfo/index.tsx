// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PositionInfo } from '../../../util/types';

import { Box, Grid, Stack, Typography } from '@mui/material';
import { Clock, Medal, WalletMoney } from 'iconsax-react';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { BN_ZERO } from '@polkadot/util';

import { info, money } from '../../../assets/gif';
import { FormatBalance2, GradientButton } from '../../../components';
import { usePoolConst, useStakingConst, useTranslation } from '../../../hooks';
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

function StakingInfo ({ onClose, onNext, selectedPosition, setSelectedPosition }: Props): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const poolConsts = usePoolConst(selectedPosition?.genesisHash);
  const stakingConsts = useStakingConst(selectedPosition?.genesisHash);
  const _decimal = selectedPosition?.decimal || stakingConsts?.decimal || 1;

  const eraLength = remainingTime(poolConsts?.eraLength?.toNumber() ?? 0);
  const handleClose = useCallback(() => onClose ? onClose() : setSelectedPosition(undefined), [onClose, setSelectedPosition]);
  const goStaking = useCallback(() => onNext ? onNext() : navigate('/pool/' + selectedPosition?.genesisHash + '/stake') as void, [selectedPosition?.genesisHash, navigate, onNext]);

  return (
    <SharePopup
      modalProps={{ noDivider: true }}
      onClose={handleClose}
      open
      popupProps={{
        maxHeight: '500px',
        openMenu: !!selectedPosition,
        px: 0,
        style: { position: 'relative' },
        withoutTopBorder: true
      }}
    >
      <Stack direction='column' sx={{ p: '10px 10px 0', position: 'relative', width: '100%', zIndex: 1 }}>
        <RedGradient style={{ right: '-3%' }} />
        <Box sx={{ alignContent: 'center', bgcolor: '#BFA1FF26', borderRadius: '12px', height: '32px', position: 'absolute', px: '10px', right: '15px', width: 'fit-content' }}>
          <Typography color='#BEAAD8' variant='B-2'>
            <FormatBalance2
              decimalPoint={2}
              decimals={[_decimal]}
              tokens={[selectedPosition?.tokenSymbol ?? '']}
              value={selectedPosition?.availableBalance ?? BN_ZERO}
            />
          </Typography>
        </Box>
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
        <Box sx={{ height: '255px', mt: '15px', overflow: 'auto', position: 'relative', width: '100%' }}>
          {(poolConsts?.minJoinBond || stakingConsts?.minNominatorBond) &&
              <InfoRow
                Icon={WalletMoney}
                text1={'Stake anytime with as little as '}
                text2={`${amountToHuman(poolConsts?.minJoinBond || stakingConsts?.minNominatorBond, _decimal)} ${selectedPosition?.tokenSymbol}`}
                text3={t('and start earning rewards actively within {{eraLength}}', { replace: { eraLength } })}
              />}
          <InfoRow
            Icon={Clock}
            text1={'Unstake anytime, and redeem your funds '}
            text2={`after ${stakingConsts?.unbondingDuration} days.`}
            text3={t('No rewards will be earned during that period')}
          />
          <InfoRow
            Icon={Medal}
            text1={'Rewards accumulate every'}
            text2={` ${stakingConsts?.eraDuration} hours.`}
            text3={t('Rewards require manual claiming if you have staked in pools')}
          />
        </Box>
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
