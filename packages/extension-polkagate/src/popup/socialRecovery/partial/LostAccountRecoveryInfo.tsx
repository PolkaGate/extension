// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
import type { DeriveAccountInfo } from '@polkadot/api-derive/types';
import type { PalletRecoveryRecoveryConfig } from '@polkadot/types/lookup';

import { Divider, Grid, SxProps, Theme, Typography, useTheme } from '@mui/material';
import React from 'react';

import { BN } from '@polkadot/util';

import { Progress, ShortAddress, Warning } from '../../../components';
import { useTranslation } from '../../../hooks';
import { amountToHuman } from '../../../util/utils';
import recoveryDelayPeriod from '../util/recoveryDelayPeriod';
import { DisplayInfo } from './Confirmation';

interface Props {
  accountsInfo: DeriveAccountInfo[] | undefined;
  lostAccountRecoveryInfo: PalletRecoveryRecoveryConfig | null | undefined
  style?: SxProps<Theme> | undefined;
  decimal: number | undefined;
  token: string | undefined;
}

export default function LostAccountRecoveryInfo({ accountsInfo, decimal, lostAccountRecoveryInfo, style, token }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Grid container direction='column' item sx={{ '> :not(:last-child)': { borderBottom: '1px solid', borderBottomColor: '#D5CCD0' }, bgcolor: 'background.paper', boxShadow: '0px 4px 4px 0px #00000040', display: 'block', maxHeight: '270px', mt: '20px', overflow: 'hidden', overflowY: 'scroll', p: '20px', ...style }}>
      {lostAccountRecoveryInfo === undefined &&
        <Progress pt='30px' size={100} title={t('Checking the lost account recovery status...')} />
      }
      {lostAccountRecoveryInfo === null &&
        <Grid container item justifyContent='center' sx={{ '> div.belowInput': { m: 0 }, '> div.belowInput .warningImage': { fontSize: '25px' }, height: '55px', pt: '15px' }}>
          <Warning
            fontSize={'18px'}
            fontWeight={500}
            isBelowInput
            theme={theme}
          >
            {t<string>('This account is not recoverable, try another address.')}
          </Warning>
        </Grid>
      }
      {lostAccountRecoveryInfo &&
        <Grid container item justifyContent='center'>
          <Typography fontSize='18px' fontWeight={500} pb='25px'>
            {t<string>('This account is recoverable with the following details.')}
          </Typography>
          {lostAccountRecoveryInfo.friends.map((friend, index) => {
            const friendID = accountsInfo?.find((info) => String(info.accountId) === String(friend))?.identity.display;

            return (
              <Grid alignItems='end' container justifyContent='center' key={index} sx={{ m: 'auto', pt: '5px', width: '90%' }}>
                <Typography fontSize='20px' fontWeight={400} lineHeight='23px'>
                  {t<string>(`Trusted friend ${index + 1}`)}:
                </Typography>
                {friendID &&
                  <Typography fontSize='20px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
                    {friendID}
                  </Typography>}
                <Grid fontSize='20px' fontWeight={400} item lineHeight='22px' pl='5px'>
                  <ShortAddress address={String(friend)} inParentheses={!!friendID} style={{ fontSize: '16px' }} />
                </Grid>
              </Grid>
            );
          })}
          <Grid alignItems='center' container item justifyContent='center' pt='8px'>
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '240px' }} />
          </Grid>
          <DisplayInfo
            caption={t<string>('Threshold:')}
            fontSize='20px'
            value={`${lostAccountRecoveryInfo.threshold.toNumber()} of ${lostAccountRecoveryInfo.friends.length}`}
          />
          <DisplayInfo
            caption={t<string>('Delay:')}
            fontSize='20px'
            value={recoveryDelayPeriod(lostAccountRecoveryInfo.delayPeriod.toNumber())}
          />
          <DisplayInfo
            caption={t<string>('Deposited:')}
            fontSize='20px'
            showDivider={false}
            value={`${amountToHuman(new BN(lostAccountRecoveryInfo.deposit.toString()), decimal, 4)} ${token ?? ''}`}
          />
        </Grid>
      }
    </Grid>
  );
}
