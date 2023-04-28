// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Check as CheckIcon, Close as CloseIcon, RemoveCircle as AbstainIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import { ShowBalance } from '../../../../components';
import { useApi, useFormatted, useTranslation } from '../../../../hooks';
import { ReferendumSubScan } from '../../utils/types';
import { getAddressVote, getConviction, isAye, Vote } from './util';

interface Props {
  address: string | undefined;
  referendumInfoFromSubscan: ReferendumSubScan | undefined;
}

export default function MyVote({ address, referendumInfoFromSubscan }: Props): React.ReactElement {
  const { t } = useTranslation();
  const api = useApi(address);
  const theme = useTheme();
  const formatted = useFormatted(address);
  const [vote, setVote] = useState<Vote | null>();

  const isOngoing = useMemo(() => !['Executed', 'Rejected'].includes(referendumInfoFromSubscan?.status), [referendumInfoFromSubscan]);

  useEffect(() => {
    const refIndex = referendumInfoFromSubscan?.referendum_index;
    const trackId = referendumInfoFromSubscan?.origins_id;

    formatted && api && refIndex && trackId && getAddressVote(formatted, api, refIndex, trackId).then((vote) => {
      console.log('vote:::', vote);
      setVote(vote);
    }).catch(console.error);
  }, [formatted, api, referendumInfoFromSubscan]);

  const voteBalance = useMemo((): number =>
    vote?.standard?.balance || vote?.splitAbstain?.abstain || vote?.delegating?.balance
    , [vote]);

  const voteType = useMemo((): string | undefined => {
    if (vote) {
      if (vote?.standard?.vote) {
        return isAye(vote.standard.vote) ? 'Aye' : 'Nay';
      }

      if (vote?.splitAbstain?.abstain) {
        return 'Abstain';
      }

      if (vote?.delegating?.balance) {
        if (vote?.delegating?.aye) {
          return 'Aye';
        }

        if (vote?.delegating?.nay) {
          return 'Nay';
        }

        return 'Abstain';
      }
    }
  }, [vote]);

  return (
    <>
      {isOngoing &&
        <Grid alignItems={'center'} container item justifyContent='space-between' sx={{ bgcolor: 'background.paper', borderRadius: '10px', py: '30px' }} xs={12}>
          <Grid item sx={{ borderBottom: `1px solid ${theme.palette.text.disabled}`, mt: '15px', mx: '25px' }} xs={12}>
            <Typography sx={{ fontSize: '22px', fontWeight: 700 }}>
              {t('My Vote')}
            </Typography>
          </Grid>
          <Grid alignItems='center' container item justifyContent='space-between' sx={{ pt: '20px', px: '10%' }}>
            <Grid container item xs={8}>
              <Grid item sx={{ fontSize: '20px', fontWeight: 500 }}>
                <ShowBalance api={api} balance={voteBalance} decimalPoint={1} />
              </Grid>
              <Grid item sx={{ fontSize: '18px', fontWeight: 500, pl: '5px' }}>
                {vote?.standard?.vote && `(${getConviction(vote.standard.vote)}x)`}
                {vote?.delegating?.conviction && `(${vote.delegating.conviction}x)`}
              </Grid>
            </Grid>
            <Grid alignItems='center' container item justifyContent='flex-end' sx={{ fontSize: '16px', fontWeight: 400 }} xs>
              {voteType &&
                <>
                  {voteType === 'Aye' && <>
                    <CheckIcon sx={{ color: 'aye.main', fontSize: '15px' }} />
                    {t('Aye')}
                  </>
                  }
                  {voteType === 'Nay' && <>
                    <CloseIcon sx={{ color: 'nay.main', fontSize: '15px' }} />
                    {t('Nay')}
                  </>
                  }
                  {voteType === 'Abstain' && <>
                    <AbstainIcon sx={{ color: 'primary.light', fontSize: '15px' }} />
                    {t('Abstain')}
                  </>
                  }
                </>
              }
            </Grid>
          </Grid>
        </Grid>
      }
    </>
  );
}
