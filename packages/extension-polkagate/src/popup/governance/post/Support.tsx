// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Grid, LinearProgress, Typography, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { BN } from '@polkadot/util';

import { ShowBalance, ShowValue } from '../../../components';
import { useApi, useCurrentBlockNumber, useCurrentSupportThreshold, useDecimal, useToken, useTrack, useTranslation } from '../../../hooks';
import { ReferendumPolkassembly, ReferendumSubScan } from '../utils/types';
import { toTitleCase } from '../utils/util';

interface Props {
  address: string | undefined;
  referendumInfoFromSubscan: ReferendumSubScan | undefined;
  referendumFromPA: ReferendumPolkassembly | undefined;
}

export default function Support({ address, referendumFromPA, referendumInfoFromSubscan }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const { state } = useLocation();
  const decimal = useDecimal(address);
  const api = useApi(address);
  const token = useToken(address);
  const currentBlock = useCurrentBlockNumber(address);

  const [totalIssuance, setTotalIssuance] = useState<BN>();
  const [inactiveIssuance, setInactiveIssuance] = useState<BN>();
  const trackName = useMemo((): string | undefined => {
    const name = ((state?.selectedSubMenu !== 'All' && state?.selectedSubMenu) || referendumInfoFromSubscan?.origins || referendumFromPA?.origin) as string | undefined;

    return name && toTitleCase(name);
  }, [referendumFromPA?.origin, referendumInfoFromSubscan?.origins, state?.selectedSubMenu]);

  const track = useTrack(address, trackName);
  const currentSupportThreshold = useCurrentSupportThreshold(track?.[1], currentBlock && referendumInfoFromSubscan && currentBlock - referendumInfoFromSubscan?.timeline[1]?.block);

  const supportPercent = useMemo(() =>
    totalIssuance && inactiveIssuance && referendumInfoFromSubscan && (Number(referendumInfoFromSubscan.support_amount) * 100 / Number(totalIssuance.sub(inactiveIssuance)))
    , [inactiveIssuance, referendumInfoFromSubscan, totalIssuance]);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.query.balances.totalIssuance().then(setTotalIssuance).catch(console.error);
    api.query.balances.inactiveIssuance().then(setInactiveIssuance).catch(console.error);
  }, [api]);

  const Tally = ({ amount, color, percent, text, total }: { text: string, percent: number | undefined, color: string, count: number, amount: string | undefined }) => (
    <Grid container item justifyContent='center' sx={{ width: '45%' }}>
      <Typography sx={{ borderBottom: `8px solid ${color}`, textAlign: 'center', fontSize: '20px', fontWeight: 500, width: '100%' }}>
        {text}
      </Typography>
      <Grid container fontSize='22px' item>
        <Grid fontWeight={700} item sx={{ textAlign: 'center' }} xs={12} mt='15px'>
          <ShowValue value={percent && `${percent?.toFixed(2)}%`} />
        </Grid>
        <Grid color='text.disabled' fontSize='14px' fontWeight={400} item sx={{ textAlign: 'center' }} xs={12}>
          {t('of all tokens')}
        </Grid>
      </Grid>
      <Grid color='text.disabled' fontSize='16px' fontWeight={500} item pt='15px'>
        <ShowBalance
          balance={amount && new BN(amount)}
          decimal={decimal}
          decimalPoint={2}
          token={token}
        />
      </Grid>
      <Grid color='text.disabled' container fontSize='14px' fontWeight={400} item justifyContent='center'>
        <Grid item pr='3px'>
          {t('of')}
        </Grid>
        <Grid item>
          <ShowBalance
            balance={total && new BN(total)}
            decimal={decimal}
            decimalPoint={2}
            token={token}
          />
        </Grid>
      </Grid>
    </Grid>
  );

  const currentSupportColor = '#008080';
  const supportThresholdColor = '#BCE2DB';

  const progressBgColor = supportPercent < currentSupportThreshold ? supportThresholdColor : currentSupportColor;
  const progressColor = supportPercent < currentSupportThreshold ? currentSupportColor : supportThresholdColor;
  const progressValue = Math.min(supportPercent, currentSupportThreshold) * 100 / Math.max(supportPercent, currentSupportThreshold);

  return (
    <Grid alignItems='flex-start' container item sx={{ bgcolor: 'background.paper', borderRadius: '10px', maxWidth: '450px', mt: '10px', pb: '45px' }}>
      <Grid item sx={{ borderBottom: `1px solid ${theme.palette.text.disabled}`, my: '15px', mx: '25px' }} xs={12}>
        <Typography sx={{ fontSize: '22px', fontWeight: 700 }}>
          {t('Support')}
        </Typography>
      </Grid>
      <Grid item sx={{ mb: '27px', px: '24px', textAlign: 'center' }} xs={12} >
        <LinearProgress
          color='inherit'
          sx={{ height: '33px', width: '100%', bgcolor: progressBgColor, color: progressColor, mt: '13px' }}
          value={progressValue}
          variant='determinate'
        />
      </Grid>
      <Grid container item justifyContent='space-around' xs={12}>
        <Tally
          amount={referendumInfoFromSubscan?.ayes_amount}
          color={'#008080'}
          percent={supportPercent}
          text={t('Current')}
          total={totalIssuance}
        />
        <Tally
          amount={referendumInfoFromSubscan?.nays_amount}
          color={'#BCE2DB'}
          percent={currentSupportThreshold}
          text={t('Threshold')}
          total={totalIssuance}
        />
      </Grid>
    </Grid >
  );
}
