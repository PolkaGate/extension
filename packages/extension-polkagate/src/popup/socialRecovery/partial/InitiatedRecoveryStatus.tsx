// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { PalletRecoveryRecoveryConfig } from '@polkadot/types/lookup';

import { AccessTime as AccessTimeIcon, Check as CheckIcon } from '@mui/icons-material';
import { Box, Divider, Grid, SxProps, Theme, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';

import { rescueRecoveryGreen } from '../../../assets/icons';
import { Identity, Progress, ShowBalance2 } from '../../../components';
import { useTranslation } from '../../../hooks';
import { ActiveRecoveryFor } from '../../../hooks/useActiveRecoveries';
import recoveryDelayPeriod from '../util/recoveryDelayPeriod';
import RemainingTime from './RemainingDelayTime';

interface Props {
  api: ApiPromise | undefined;
  chain: Chain | null | undefined;
  style?: SxProps<Theme> | undefined;
  lostAccountRecoveryInfo: PalletRecoveryRecoveryConfig | null | undefined;
  initiatedRecovery: ActiveRecoveryFor | null;
  delayRemainBlock: number;
  isDelayPassed: boolean | undefined;
  isVouchedCompleted: boolean | undefined;
}

export default function InitiatedRecoveryStatus({ api, chain, delayRemainBlock, initiatedRecovery, isDelayPassed, isVouchedCompleted, lostAccountRecoveryInfo, style }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const friendsCount = useMemo(() => {
    const threshold = lostAccountRecoveryInfo?.threshold?.toNumber() ?? 0;
    const vouchedFriends = initiatedRecovery?.vouchedFriends?.length ?? 0;
    const index = Math.max(0, threshold - vouchedFriends);
    const friendsArray = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

    return friendsArray[index] ?? 'zero';
  }, [initiatedRecovery?.vouchedFriends?.length, lostAccountRecoveryInfo?.threshold]);

  return (
    <Grid container direction='column' item sx={{ bgcolor: 'background.paper', boxShadow: '0px 4px 4px 0px #00000040', display: 'block', mt: '20px', p: '20px', ...style }}>
      {!lostAccountRecoveryInfo
        ? <>
          <Progress pt='0px' size={100} title={t('Checking the recovery status...')} />
        </>
        : <>
          <Grid alignItems='center' container item pb='10px' width='fit-content'>
            <Box
              component='img'
              src={rescueRecoveryGreen as string}
              sx={{ height: '26px', width: '26px' }}
            />
            <Typography fontSize='22px' fontWeight={500} pl='15px'>
              {friendsCount !== 'zero'
                ? t<string>(`You initiated a recovery and need ${friendsCount} vouches.`)
                : t<string>('You initiated a recovery and received all required vouches.')}
            </Typography>
          </Grid>
          <Grid container item py='15px'>
            <Grid container item justifyContent='space-between'>
              <Typography fontSize='18px' fontWeight={500} width='80%'>
                {t<string>('Trusted Friends')}
              </Typography>
              <Typography fontSize='18px' fontWeight={500} textAlign='center' width='20%'>
                {t<string>('Vouches')}
              </Typography>
            </Grid>
            <Grid container direction='column' item sx={{ '> div:last-child': { border: 'none' }, borderBlock: '2px solid', borderBlockColor: '#D5CCD0', maxHeight: '230px', overflow: 'hidden', overflowY: 'scroll' }}>
              {lostAccountRecoveryInfo.friends.map((friend, index) => (
                <Grid container item key={index} sx={{ borderBottom: '1px solid', borderBottomColor: '#D5CCD0' }}>
                  <Grid alignItems='center' container item py='5px' width='80%'>
                    <Typography fontSize='18px' fontWeight={400} pr='15px'>
                      {t<string>(`${index + 1}`)}
                    </Typography>
                    <Grid container item width='65%'>
                      <Identity
                        api={api}
                        chain={chain}
                        direction='row'
                        formatted={String(friend)}
                        identiconSize={25}
                        style={{ fontSize: '20px' }}
                        withShortAddress
                      />
                    </Grid>
                  </Grid>
                  <Grid alignItems='center' container item justifyContent='center' sx={{ borderLeft: '1px solid', borderLeftColor: '#D5CCD0' }} width='20%'>
                    {initiatedRecovery?.vouchedFriends.includes(String(friend))
                      ? <>
                        <CheckIcon sx={{ color: theme.palette.success.main, fontSize: '24px', mr: '8px' }} />
                        <Typography fontSize='14px' fontWeight={400}>{t<string>('Done')}</Typography>
                      </>
                      : <>
                        <AccessTimeIcon sx={{ color: theme.palette.success.main, fontSize: '24px', mr: '8px' }} />
                        <Typography fontSize='14px' fontWeight={400}>{t<string>('Waiting')}</Typography>
                      </>
                    }
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid alignItems='center' container item justifyContent='space-between'>
            <Grid alignItems='center' container item justifyContent='space-around' width='35%'>
              <Typography fontSize='18px' fontWeight={400}>
                {t<string>('Delay')}
              </Typography>
              <Typography fontSize='20px' fontWeight={500}>
                {recoveryDelayPeriod(lostAccountRecoveryInfo.delayPeriod.toNumber(), 1)}
              </Typography>
            </Grid>
            <Grid alignItems='center' item justifyContent='center'>
              <Divider orientation='vertical' sx={{ bgcolor: '#D5CCD0', height: '36px', width: '2px' }} />
            </Grid>
            <Grid alignItems='center' container item justifyContent='space-around' width='28%'>
              <Typography fontSize='18px' fontWeight={400}>
                {t<string>('Threshold')}
              </Typography>
              <Typography fontSize='20px' fontWeight={500}>
                {`${lostAccountRecoveryInfo.threshold.toNumber()} of ${lostAccountRecoveryInfo.friends.length}`}
              </Typography>
            </Grid>
            <Grid alignItems='center' item justifyContent='center'>
              <Divider orientation='vertical' sx={{ bgcolor: '#D5CCD0', height: '36px', width: '2px' }} />
            </Grid>
            <Grid alignItems='center' container item justifyContent='space-around' width='32%'>
              <Typography fontSize='18px' fontWeight={400}>
                {t<string>('Deposit')}
              </Typography>
              <Grid alignItems='center' container fontSize='20px' fontWeight={500} gap='10px' item width='fit-content'>
                <ShowBalance2
                  api={api}
                  balance={lostAccountRecoveryInfo.deposit}
                  decimalPoint={4}
                />
              </Grid>
            </Grid>
          </Grid>
          {isVouchedCompleted && isDelayPassed === false &&
            <Grid alignItems='center' container item sx={{ borderTop: '2px solid', borderTopColor: '#D5CCD0', pt: '12px', mt: '15px' }}>
              <Grid alignItems='center' container item>
                <AccessTimeIcon sx={{ color: theme.palette.success.main, fontSize: '24px', mr: '8px', width: 'fit-content' }} />
                <Typography fontSize='20px' fontWeight={500}>
                  {t<string>('You need to wait for the delay time to pass to be able to withdraw.')}
                </Typography>
              </Grid>
              <RemainingTime delayInSecond={delayRemainBlock * 6} />
            </Grid>
          }
        </>}
    </Grid>
  );
}
