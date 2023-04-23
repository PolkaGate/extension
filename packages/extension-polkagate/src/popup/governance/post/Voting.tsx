// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Grid, LinearProgress, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { BN } from '@polkadot/util';

import { ShowBalance, ShowValue } from '../../../components';
import { useCurrentApprovalThreshold, useCurrentBlockNumber, useDecimal, useToken, useTrack, useTranslation } from '../../../hooks';
import { ReferendumPolkassembly, ReferendumSubScan } from '../utils/types';
import { toTitleCase } from '../utils/util';
import VoteChart from './VoteChart';

interface Props {
  address: string | undefined;
  referendumInfoFromSubscan: ReferendumSubScan | undefined;
  referendumFromPA: ReferendumPolkassembly | undefined;
}

export default function Voting({ address, referendumFromPA, referendumInfoFromSubscan }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const { state } = useLocation();
  const decimal = useDecimal(address);
  const token = useToken(address);
  const currentBlock = useCurrentBlockNumber(address);

  const trackName = useMemo((): string | undefined => {
    const name = ((state?.selectedSubMenu !== 'All' && state?.selectedSubMenu) || referendumInfoFromSubscan?.origins || referendumFromPA?.origin) as string | undefined;

    return name && toTitleCase(name);
  }, [referendumFromPA?.origin, referendumInfoFromSubscan?.origins, state?.selectedSubMenu]);

  const track = useTrack(address, trackName);
  const currentApprovalThreshold = useCurrentApprovalThreshold(track?.[1], currentBlock && referendumInfoFromSubscan && currentBlock - referendumInfoFromSubscan?.timeline[1]?.block);

  const ayesPercent = useMemo(() => referendumInfoFromSubscan ? Number(referendumInfoFromSubscan.ayes_amount) / (Number(referendumInfoFromSubscan.ayes_amount) + Number(new BN(referendumInfoFromSubscan.nays_amount))) * 100 : 0, [referendumInfoFromSubscan]);
  const naysPercent = useMemo(() => referendumInfoFromSubscan ? Number(referendumInfoFromSubscan.nays_amount) / (Number(referendumInfoFromSubscan.ayes_amount) + Number(new BN(referendumInfoFromSubscan.nays_amount))) * 100 : 0, [referendumInfoFromSubscan]);

  const Tally = ({ amount, color, count, percent, text }: { text: string, percent: number, color: string, count: number, amount: string | undefined }) => (
    <Grid container item justifyContent='center' sx={{ width: '45%' }}>
      <Typography sx={{ borderBottom: `8px solid ${color}`, textAlign: 'center', fontSize: '20px', fontWeight: 500, width: '100%' }}>
        {text}
      </Typography>
      <Grid container fontSize='22px' item justifyContent='space-around'>
        <Grid fontWeight={700} item>
          {percent?.toFixed(1)}%
        </Grid>
        <Grid color='text.disabled' fontWeight={400} item>
          {`(${count || ''})`}
        </Grid>
      </Grid>
      <Grid color='text.disabled' fontSize='16px' fontWeight={500} item>
        <ShowBalance
          balance={amount && new BN(amount)}
          decimal={decimal}
          decimalPoint={2}
          token={token}
        />
      </Grid>
    </Grid>
  );

  return (
    <Grid alignItems='flex-start' container item sx={{ bgcolor: 'background.paper', borderRadius: '10px', maxWidth: '450px', mt: '10px' }}>
      <Grid item sx={{ borderBottom: `1px solid ${theme.palette.text.disabled}`, my: '15px', mx: '25px' }} xs={12}>
        <Typography sx={{ fontSize: '22px', fontWeight: 700 }}>
          {t('Voting')}
        </Typography>
      </Grid>
      <Grid item xs={12} sx={{ px: '25px' }}>
        <VoteChart referendum={referendumInfoFromSubscan} />
      </Grid>
      <Grid container item justifyContent='space-around' xs={12}>
        <Tally
          amount={referendumInfoFromSubscan?.ayes_amount}
          color={'#008080'}
          count={referendumInfoFromSubscan?.ayes_count}
          percent={ayesPercent}
          text={t('Ayes')}
        />
        <Tally
          amount={referendumInfoFromSubscan?.nays_amount}
          color={'#FF5722'}
          count={referendumInfoFromSubscan?.nays_count}
          percent={naysPercent}
          text={t('Nays')}
        />
        <Grid item sx={{ px: '24px', textAlign: 'center' }} xs={12}>
          <Typography fontSize='20px' fontWeight={500} pt='32px'>
            {t('Approval threshold')}
          </Typography>
          <LinearProgress
            color='inherit'
            sx={{ height: '33px', width: '100%', bgcolor: 'approval.contrastText', color: 'approval.main', mt: '10px' }}
            value={currentApprovalThreshold || 0}
            variant='determinate'
          />
          <Grid fontSize='24px' fontWeight={700} item pt='15px' pb='30px'>
            <ShowValue value={currentApprovalThreshold && `${currentApprovalThreshold}%`} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
