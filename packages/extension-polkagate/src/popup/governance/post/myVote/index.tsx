// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Check as CheckIcon, Close as CloseIcon, RemoveCircle as AbstainIcon } from '@mui/icons-material';
import { Grid, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { ShowBalance } from '../../../../components';
import { useApi, useDecimal, useToken, useTranslation } from '../../../../hooks';
import { getVoteType } from '../../utils/util';
import { getConviction, Vote } from './util';

interface Props {
  address: string | undefined;
  vote: Vote | null | undefined;
  notVoted: boolean | undefined;
  isFinished: boolean | undefined;
}

export default function MyVote({ address, notVoted, vote, isFinished }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi(address);
  const decimal = useDecimal(address);
  const token = useToken(address);
  const voteBalance = useMemo((): number | undefined => (vote?.standard?.balance || vote?.splitAbstain?.abstain || vote?.delegating?.balance), [vote]);
  const voteType = getVoteType(vote);
  const voteMethod = vote?.standard?.balance || vote?.splitAbstain?.abstain
    ? t('Standard')
    : vote?.delegating?.voted && vote?.delegating?.balance && t('Delegated');

  return (
    <Grid alignItems={'center'} container item justifyContent='space-between' sx={{ bgcolor: 'background.paper', borderRadius: '10px', mb: '10px', py: '10px', border: 1, borderColor: theme.palette.mode === 'light' ? 'background.paper' : 'secondary.main' }} xs={12}>
      <Grid alignItems='baseline' container item spacing={0.2} sx={{ borderBottom: `1px solid ${theme.palette.text.disabled}`, mx: '25px' }} xs={12}>
        <Grid item>
          <Typography sx={{ fontSize: '22px', fontWeight: 700 }}>
            {t('My Vote')}
          </Typography>
        </Grid>
        <Grid item>
          {voteMethod &&
            <Typography sx={{ fontSize: '16px', fontWeight: 400, pl: '3px' }}>
              ({voteMethod})
            </Typography>
          }
        </Grid>
      </Grid>
      {notVoted
        ? <Grid alignItems='center' container item sx={{ pt: '20px', px: '10%' }}>
          <Typography sx={{ fontSize: '24px', fontWeight: 700 }}>
            {isFinished ? t('No participation.') : t('No votes cast yet.')}
          </Typography>
        </Grid>
        : !voteBalance
          ? <Grid alignItems='center' container item sx={{ pt: '20px', px: '10%' }}>
            <Skeleton sx={{ borderRadius: '5px', display: 'inline-block', height: '20px', transform: 'none', width: '90%' }} />
          </Grid>
          : <Grid alignItems='center' container item justifyContent='space-between' sx={{ pt: '20px', px: '10%' }}>
            <Grid container item xs={8}>
              <Grid item sx={{ fontSize: '20px', fontWeight: 500 }}>
                <ShowBalance api={api} balance={voteBalance} decimal={decimal} decimalPoint={1} token={token} />
              </Grid>
              <Grid item sx={{ fontSize: '18px', fontWeight: 500, pl: '5px' }}>
                {vote?.standard?.vote && `(${getConviction(vote.standard.vote)}x)`}
                {vote?.delegating?.conviction && `(${vote.delegating.conviction}x)`}
              </Grid>
            </Grid>
            <Grid alignItems='center' container item justifyContent='flex-end' sx={{ fontSize: '16px', fontWeight: 400 }} xs>
              {voteType &&
                <>
                  {voteType === 'Aye' &&
                    <>
                      <CheckIcon sx={{ color: 'aye.main', fontSize: '24px', stroke: theme.palette.aye.main, strokeWidth: 1.5 }} />
                      {t('Aye')}
                    </>
                  }
                  {voteType === 'Nay' &&
                    <>
                      <CloseIcon sx={{ color: 'nay.main', fontSize: '24px', stroke: theme.palette.nay.main, strokeWidth: 1.5 }} />
                      {t('Nay')}
                    </>
                  }
                  {voteType === 'Abstain' &&
                    <>
                      <AbstainIcon sx={{ color: 'primary.light', fontSize: '22px', mr: '2px', stroke: theme.palette.primary.light, strokeWidth: 1.5 }} />
                      {t('Abstain')}
                    </>
                  }
                </>
              }
            </Grid>
          </Grid>
      }
    </Grid>
  );
}
