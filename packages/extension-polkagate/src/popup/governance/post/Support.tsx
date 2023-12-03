// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import { BN } from '@polkadot/util';

import { Infotip2, ShowBalance, ShowValue } from '../../../components';
import { useApi, useCurrentBlockNumber, useCurrentSupportThreshold, useDecimal, useToken, useTranslation } from '../../../hooks';
import { Referendum, Track } from '../utils/types';
import { submittedBlock } from './Voting';

interface Props {
  address: string | undefined;
  referendum: Referendum | undefined;
  track: Track | undefined;
}

export default function Support({ address, referendum, track }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const decimal = useDecimal(address);
  const api = useApi(address);
  const token = useToken(address);
  const currentBlock = useCurrentBlockNumber(address);

  const [totalIssuance, setTotalIssuance] = useState<BN>();
  const [inactiveIssuance, setInactiveIssuance] = useState<BN>();
  const [fellowshipCount, setFellowshipCount] = useState<number>();

  const isFellowship = referendum?.type === 'FellowshipReferendum';
  const blockSubmitted = submittedBlock(referendum);
  const threshold = useCurrentSupportThreshold(track?.[1], (currentBlock && blockSubmitted) && currentBlock - blockSubmitted);

  const currentSupportThreshold = useMemo(() => {
    if (track?.[1]?.preparePeriod && currentBlock && blockSubmitted) {
      if (currentBlock - blockSubmitted < track[1].preparePeriod.toNumber()) {
        return 50; // in prepare period
      }

      return threshold;
    }
  }, [blockSubmitted, currentBlock, threshold, track]);

  const supportPercent = useMemo(() => {
    if (totalIssuance && inactiveIssuance && referendum?.supportAmount) {
      if (isFellowship) {
        return fellowshipCount && (Number(referendum.ayesCount) * 100 / fellowshipCount);
      }

      return (Number(referendum.supportAmount) * 100 / Number(totalIssuance.sub(inactiveIssuance)));
    }
  }, [fellowshipCount, inactiveIssuance, isFellowship, referendum, totalIssuance]);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.query.balances.totalIssuance().then(setTotalIssuance).catch(console.error);
    api.query.balances.inactiveIssuance().then(setInactiveIssuance).catch(console.error);
    api.query.fellowshipCollective && api.query.fellowshipCollective.members.entries().then((keys) => setFellowshipCount(keys?.length));
  }, [api]);

  const Tally = ({ amount, color, percent, text, total }: { amount: string | number | undefined, text: string, percent: number | undefined, color: string, total: BN | undefined }) => (
    <Grid container item justifyContent='center' sx={{ width: '45%' }}>
      <Typography sx={{ borderBottom: `8px solid ${color}`, fontSize: '20px', fontWeight: 500, textAlign: 'center', width: '115px' }}>
        {text}
      </Typography>
      <Grid container item justifyContent='center' sx={{ fontSize: '22px', fontWeight: 700, height: '27px', mt: '15px' }}>
        <ShowValue value={percent !== undefined ? `${percent.toFixed(2)}%` : undefined} width='115px' />
      </Grid>
      <Grid container item justifyContent='center' sx={{ color: theme.palette.mode === 'light' ? 'text.disabled' : 'text.main', fontSize: '16px', fontWeight: 500, pt: '15px' }}>
        {isFellowship
          ? <ShowValue
            value={amount}
            width='115px'
          />
          : <ShowBalance
            balance={amount !== undefined ? new BN(amount) : undefined}
            decimal={decimal}
            decimalPoint={2}
            skeletonWidth={115}
            token={token}
          />
        }
      </Grid>
      {total || fellowshipCount !== undefined
        ? <Grid color={theme.palette.mode === 'light' ? 'text.disabled' : 'text.main'} container fontSize='14px' fontWeight={400} item justifyContent='center'>
          <Grid item pr='3px'>
            {t('of')}
          </Grid>
          <Grid item>
            {isFellowship
              ? <ShowValue
                value={fellowshipCount}
              />
              : <ShowBalance
                balance={total && new BN(total)}
                decimal={decimal}
                decimalPoint={2}
                token={token}
              />
            }
          </Grid>
        </Grid>
        : <Skeleton animation='wave' height='20px' sx={{ display: 'inline-block', transform: 'none', width: '115px' }} />
      }
    </Grid>
  );

  return (
    <Grid alignItems='flex-start' container item sx={{ bgcolor: 'background.paper', borderRadius: '10px', mt: '10px', pb: '45px', border: 1, borderColor: theme.palette.mode === 'light' ? 'background.paper' : 'secondary.main' }}>
      <Grid item sx={{ borderBottom: `1px solid ${theme.palette.text.disabled}`, mt: '15px', mx: '25px' }} xs={12}>
        <Infotip2 showQuestionMark text={t('Support is determined by the proportion of tokens contributed in voting out of the total token supply.')}>
          <Typography sx={{ fontSize: '22px', fontWeight: 700 }}>
            {t('Support')}
          </Typography>
        </Infotip2>
      </Grid>
      <Grid container item justifyContent='space-around' sx={{ mt: '25px' }} xs={12}>
        <Tally
          amount={isFellowship ? referendum?.ayesCount : referendum?.supportAmount}
          color={`${theme.palette.support.contrastText}`}
          percent={supportPercent}
          text={t('Current')}
          total={isFellowship ? fellowshipCount : totalIssuance}
        />
        <Tally
          amount={isFellowship
            ? currentSupportThreshold && fellowshipCount && Math.ceil(fellowshipCount / 100 * currentSupportThreshold)
            : currentSupportThreshold && totalIssuance?.divn(100).muln(currentSupportThreshold)?.toString()}
          color={`${theme.palette.support.main}`}
          percent={currentSupportThreshold}
          text={t('Threshold')}
          total={isFellowship ? fellowshipCount : totalIssuance}
        />
      </Grid>
    </Grid>
  );
}
