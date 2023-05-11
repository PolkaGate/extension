// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { BN } from '@polkadot/util';

import { Infotip, ShowBalance, ShowValue } from '../../../components';
import { useApi, useCurrentBlockNumber, useCurrentSupportThreshold, useDecimal, useToken, useTrack, useTranslation } from '../../../hooks';
import { ReferendumPolkassembly, ReferendumSubScan } from '../utils/types';
import { toTitleCase } from '../utils/util';

interface Props {
  address: string | undefined;
  referendumFromSb: ReferendumSubScan | undefined;
  referendumFromPA: ReferendumPolkassembly | undefined;
}

export default function Support({ address, referendumFromPA, referendumFromSb }: Props): React.ReactElement<Props> {
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
    const name = ((state?.selectedSubMenu !== 'All' && state?.selectedSubMenu) || referendumFromSb?.origins || referendumFromPA?.origin) as string | undefined;

    return name && toTitleCase(name);
  }, [referendumFromPA?.origin, referendumFromSb?.origins, state?.selectedSubMenu]);

  const track = useTrack(address, trackName);

  const threshold = useCurrentSupportThreshold(track?.[1], currentBlock && referendumFromSb && currentBlock - referendumFromSb?.timeline[1]?.block);

  const currentSupportThreshold = useMemo(() => {
    if (track?.[1]?.preparePeriod && currentBlock && referendumFromSb) {
      const blockSubmitted = referendumFromSb.timeline[0].block;

      if (currentBlock - blockSubmitted < track[1].preparePeriod) {
        // in prepare period
        return 50;
      }

      return threshold;
    }
  }, [currentBlock, referendumFromSb, threshold, track]);

  const supportPercent = useMemo(() =>
    totalIssuance && inactiveIssuance && referendumFromSb && (Number(referendumFromSb.support_amount) * 100 / Number(totalIssuance.sub(inactiveIssuance)))
    , [inactiveIssuance, referendumFromSb, totalIssuance]);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.query.balances.totalIssuance().then(setTotalIssuance).catch(console.error);
    api.query.balances.inactiveIssuance().then(setInactiveIssuance).catch(console.error);
  }, [api]);

  const Tally = ({ amount, color, percent, text, total }:
    { text: string, percent: number | undefined, color: string, amount: string | undefined, total: BN | undefined }) => (
    <Grid container item justifyContent='center' sx={{ width: '45%' }}>
      <Typography sx={{ borderBottom: `8px solid ${color}`, fontSize: '20px', fontWeight: 500, textAlign: 'center', width: '100%' }}>
        {text}
      </Typography>
      <Grid container fontSize='22px' item>
        <Grid fontWeight={700} item sx={{ height: '27px', textAlign: 'center' }} xs={12} mt='15px'>
          <ShowValue value={percent !== undefined ? `${percent?.toFixed(2)}%` : undefined} />
        </Grid>
      </Grid>
      <Grid color='text.disabled' fontSize='16px' fontWeight={500} item pt='15px' pl='12%'>
        <ShowBalance
          balance={amount !== undefined ? new BN(amount) : undefined}
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

  return (
    <Grid alignItems='flex-start' container item sx={{ bgcolor: 'background.paper', borderRadius: '10px', mt: '10px', pb: '45px' }}>
      <Grid item sx={{ borderBottom: `1px solid ${theme.palette.text.disabled}`, mt: '15px', mx: '25px' }} xs={12}>
        <Infotip iconLeft={-150} iconTop={10} showQuestionMark text={t('Support is the ratio of votes in favor of a referendum to the total possible votes.')}>
          <Typography sx={{ fontSize: '22px', fontWeight: 700 }}>
            {t('Support')}
          </Typography>
        </Infotip>
      </Grid>
      <Grid container item justifyContent='space-around' xs={12} sx={{ mt: '25px' }}>
        <Tally
          amount={referendumFromSb?.support_amount}
          color={`${theme.palette.support.contrastText}`}
          percent={supportPercent}
          text={t('Current')}
          total={totalIssuance}
        />
        <Tally
          amount={currentSupportThreshold && totalIssuance?.divn(100).muln(currentSupportThreshold)?.toString()}
          color={`${theme.palette.support.main}`}
          percent={currentSupportThreshold}
          text={t('Threshold')}
          total={totalIssuance}
        />
      </Grid>
    </Grid>
  );
}
