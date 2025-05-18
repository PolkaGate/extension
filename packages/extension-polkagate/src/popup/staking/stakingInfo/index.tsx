// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import type { TransitionProps } from '@mui/material/transitions';
import type { PositionInfo } from '../../../util/types';

import { Box, Container, Dialog, Grid, Slide, Typography } from '@mui/material';
import { Clock, Medal, WalletMoney } from 'iconsax-react';
import React, { useCallback } from 'react';

import { BN_ZERO, noop } from '@polkadot/util';

import { info, money } from '../../../assets/gif';
import { FormatBalance2, GradientButton } from '../../../components';
import CustomCloseSquare from '../../../components/SVG/CustomCloseSquare';
import { usePoolConst, useStakingConst, useTranslation } from '../../../hooks';
import { RedGradient } from '../../../style';
import { remainingTime } from '../../../util/time';
import { amountToHuman } from '../../../util/utils';
import InfoRow from './InfoRow';
import Title from './Title';

interface Props {
  setSelectedPosition: React.Dispatch<React.SetStateAction<PositionInfo | undefined>>;
  selectedPosition: PositionInfo;
}

const Transition = React.forwardRef(function Transition(props: TransitionProps & { children: React.ReactElement<unknown>; }, ref: React.Ref<unknown>) {
  return <Slide direction='up' easing='ease-in-out' ref={ref} timeout={250} {...props} />;
});

function StakingInfo ({ selectedPosition, setSelectedPosition }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { availableBalance, decimal, genesisHash, tokenSymbol } = selectedPosition;
  const poolConsts = usePoolConst(genesisHash);
  const stakingConsts = useStakingConst(genesisHash);
  const _decimal = decimal || stakingConsts?.decimal || 1;

  const eraLength = remainingTime(poolConsts?.eraLength?.toNumber() ?? 0);
  const handleClose = useCallback(() => setSelectedPosition(undefined), [setSelectedPosition]);

  return (
    <Dialog
      PaperProps={{
        sx: {
          backgroundImage: 'unset',
          bgcolor: 'transparent',
          boxShadow: 'unset'
        }
      }}
      TransitionComponent={Transition}
      componentsProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(7px)',
            background: 'radial-gradient(50% 44.61% at 50% 50%, rgba(12, 3, 28, 0) 0%, rgba(12, 3, 28, 0.7) 100%)',
            bgcolor: 'transparent'
          }
        }
      }}
      fullScreen
      open={!!selectedPosition}
    >
      <Container disableGutters sx={{ height: '100%', width: '100%' }}>
        <Grid alignItems='center' container item justifyContent='center' sx={{ pb: '12px', pt: '18px' }}>
          <CustomCloseSquare color='#AA83DC' onClick={handleClose} size='48' style={{ cursor: 'pointer' }} />
        </Grid>
        <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: '#1B133C', border: '2px solid', borderColor: '#FFFFFF0D', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', display: 'block', height: 'calc(100% - 60 px)', overflow: 'hidden', overflowY: 'auto', p: '10px', pb: '10px', position: 'relative', width: '100%', zIndex: 1 }}>
          <RedGradient style={{ right: '-3%' }} />
          <Box sx={{ alignContent: 'center', bgcolor: '#BFA1FF26', borderRadius: '12px', height: '32px', position: 'absolute', px: '10px', right: '15px', width: 'fit-content' }}>
            <Typography color='#BEAAD8' variant='B-2'>
              <FormatBalance2
                decimalPoint={2}
                decimals={[_decimal]}
                tokens={[tokenSymbol]}
                value={availableBalance ?? BN_ZERO}
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
          <Box sx={{ height: '255px', overflowY: 'auto', position: 'relative', width: '100%', mt: '15px' }}>
            {(poolConsts?.minJoinBond || stakingConsts?.minNominatorBond) &&
              <InfoRow
                Icon={WalletMoney}
                text1={'Stake anytime with as little as '}
                text2={`${amountToHuman(poolConsts?.minJoinBond || stakingConsts?.minNominatorBond, _decimal)} ${tokenSymbol}`}
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
            onClick={noop}
            style={{
              height: '44px',
              marginTop: '15px',
              width: '100%'
            }}
            text={t('Start staking')}
          />
        </Grid>
      </Container>
    </Dialog>
  );
}

export default StakingInfo;
