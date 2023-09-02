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
import { Identity, ShowBalance2 } from '../../../components';
import { useTranslation } from '../../../hooks';
import { ActiveRecoveryFor } from '../../../hooks/useActiveRecoveries';
import recoveryDelayPeriod from '../util/recoveryDelayPeriod';

interface Props {
  api: ApiPromise | undefined;
  chain: Chain | null | undefined;
  style?: SxProps<Theme> | undefined;
  lostAccountRecoveryInfo: PalletRecoveryRecoveryConfig | undefined;
  initiatedRecovery: ActiveRecoveryFor | null;
}

export default function InitiatedRecoveryStatus({ api, chain, initiatedRecovery, lostAccountRecoveryInfo, style }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const friendsCount = useMemo(() => ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'][lostAccountRecoveryInfo?.threshold?.toNumber() ?? 0], [lostAccountRecoveryInfo?.threshold]);

  return (
    <Grid container direction='column' item sx={{ bgcolor: 'background.paper', boxShadow: '0px 4px 4px 0px #00000040', display: 'block', maxHeight: '310px', mt: '20px', overflow: 'hidden', overflowY: 'scroll', p: '20px', ...style }}>
      {!lostAccountRecoveryInfo
        ? <></>
        : <>
          <Grid alignItems='center' container item pb='10px' width='fit-content'>
            <Box
              component='img'
              src={rescueRecoveryGreen as string}
              sx={{ height: '26px', width: '26px' }}
            />
            <Typography fontSize='22px' fontWeight={500} pl='15px'>
              {t<string>(`You initiated a recovery and need ${friendsCount} vouches.`)}
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
            <Grid container direction='column' item sx={{ borderBlock: '2px solid', borderBlockColor: '#D5CCD0', maxHeight: '230px', overflow: 'hidden', overflowY: 'scroll' }}>
              {lostAccountRecoveryInfo.friends.map((friend, index) => (
                <Grid container item key={index}>
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
          <Grid alignItems='center' container item justifyContent='space-between' pt='12px'>
            <Grid container item justifyContent='space-around' width='35%'>
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
            <Grid container item justifyContent='space-around' width='28%'>
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
            <Grid container item justifyContent='space-around' width='32%'>
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
        </>}
    </Grid>
  );
}
