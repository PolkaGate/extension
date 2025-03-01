// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Referendum, Track } from '../utils/types';

import { Button, Grid, LinearProgress, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { BN } from '@polkadot/util';

import { ShowBalance, ShowValue } from '../../../components';
import { nFormatter } from '../../../components/FormatPrice';
import { useCurrentApprovalThreshold, useCurrentBlockNumber, useDecimal, useToken, useTranslation } from '../../../hooks';
import { pgBoxShadow } from '../../../util/utils';
import AllVotes from './allVote';
import VoteChart from './VoteChart';

interface Props {
  address: string | undefined;
  referendum: Referendum | undefined;
  track: Track | undefined;
}

export const submittedBlock = (referendum: Referendum | undefined) => {
  const maybeStatuses = referendum?.timelinePA?.find(({ type }) => type === 'ReferendumV2')?.statuses;
  const submittedBlockPA = maybeStatuses?.find(({ status }) => status === 'Submitted')?.block;

  return referendum?.submissionBlockOC || submittedBlockPA || referendum?.timelineSb?.find(({ status }) => status === 'Submitted')?.block;
};

export default function Voting({ address, referendum, track }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const decimal = useDecimal(address);
  const token = useToken(address);

  const currentBlock = useCurrentBlockNumber(address);
  const [openAllVotes, setOpenAllVotes] = useState(false);
  const [VoteCountsPA, setVoteCountsPA] = useState<{ ayes: number | undefined, nays: number | undefined }>();

  const isFellowship = referendum?.type ? referendum.type === 'FellowshipReferendum' : undefined;
  const blockSubmitted = submittedBlock(referendum);
  const threshold = useCurrentApprovalThreshold(track?.[1], currentBlock && blockSubmitted && (currentBlock - blockSubmitted));

  const currentApprovalThreshold = useMemo((): number | undefined => {
    if (track?.[1]?.preparePeriod && currentBlock && blockSubmitted) {
      if (blockSubmitted && track[1].preparePeriod.gtn(currentBlock - blockSubmitted)) {
        // in prepare period
        return 100;
      }

      return threshold;
    }

    return undefined;
  }, [blockSubmitted, currentBlock, threshold, track]);

  const totalVoteAmount = (referendum?.ayesAmount !== undefined && referendum?.naysAmount !== undefined)
    ? Number(referendum.ayesAmount) + Number(referendum.naysAmount)
    : undefined;

  const ayesPercent = useMemo(() => referendum && totalVoteAmount !== undefined
    ? Number(referendum.ayesAmount) !== 0
      ? Number(referendum.ayesAmount) / totalVoteAmount * 100
      : 0
    : 0, [referendum, totalVoteAmount]);

  const naysPercent = useMemo(() => referendum && totalVoteAmount !== undefined
    ? Number(referendum.naysAmount) !== 0
      ? Number(referendum.naysAmount) / totalVoteAmount * 100
      : 0
    : 0
    , [referendum, totalVoteAmount]);

  const handleOpenAllVotes = useCallback(() => {
    setOpenAllVotes(true);
  }, []);

  const Tally = ({ amount, color, count, percent, text }: { text: string, percent: number, color: string, count: number | undefined, amount: string | undefined }) => (
    <Grid container item justifyContent='center' sx={{ width: '45%' }}>
      <Typography sx={{ borderBottom: `8px solid ${color}`, fontSize: '20px', fontWeight: 500, textAlign: 'center', width: '100%' }}>
        {text}
      </Typography>
      <Grid container fontSize='22px' item justifyContent='space-around'>
        <Grid fontWeight={700} item>
          {percent === 0 ? '0' : percent?.toFixed(1)}%
        </Grid>
        <Grid color='text.disabled' fontSize='20px' fontWeight={400} item>
          {count !== undefined ? `(${nFormatter(count, 0) || ''})` : ''}
        </Grid>
      </Grid>
      <Grid color={theme.palette.mode === 'light' ? 'text.disabled' : 'text.main'} fontSize='16px' fontWeight={500} item>
        {isFellowship
          ? <ShowValue value={amount} />
          : <ShowBalance
            balance={amount && new BN(amount)}
            decimal={decimal}
            decimalPoint={2}
            token={token}
          />
        }
      </Grid>
    </Grid>
  );

  return (
    <Grid alignItems='flex-start' container item sx={{ bgcolor: 'background.paper', borderRadius: '10px', boxShadow: theme.palette.mode === 'light' ? pgBoxShadow(theme) : undefined, pb: '20px' }}>
      <Grid item sx={{ borderBottom: `1px solid ${theme.palette.text.disabled}`, mx: '25px', my: '15px' }} xs={12}>
        <Typography sx={{ fontSize: '22px', fontWeight: 700 }}>
          {t('Voting')}
        </Typography>
      </Grid>
      <Grid item sx={{ px: '25px' }} xs={12}>
        <VoteChart
          ayes={referendum?.ayesAmount}
          nays={referendum?.naysAmount}
        />
      </Grid>
      <Grid container item justifyContent='space-around' xs={12}>
        <Tally
          amount={referendum?.ayesAmount}
          color={`${theme.palette.aye.main}`}
          count={referendum?.ayesCount || VoteCountsPA?.ayes}
          percent={ayesPercent}
          text={t('Ayes')}
        />
        <Tally
          amount={referendum?.naysAmount}
          color={`${theme.palette.nay.main}`}
          count={referendum?.naysCount || VoteCountsPA?.nays}
          percent={naysPercent}
          text={t('Nays')}
        />
        <Grid item sx={{ px: '24px', textAlign: 'center' }} xs={12}>
          <Typography fontSize='20px' fontWeight={500} pt='32px'>
            {t('Approval threshold')}
          </Typography>
          <LinearProgress
            color='inherit'
            sx={{ bgcolor: 'approval.contrastText', color: 'approval.main', height: '33px', mt: '5px', width: '100%' }}
            value={currentApprovalThreshold || 0}
            variant='determinate'
          />
          <Grid fontSize='24px' fontWeight={700} item pt='15px'>
            <ShowValue value={currentApprovalThreshold && `${currentApprovalThreshold}%`} />
          </Grid>
        </Grid>
      </Grid>
      <Grid container justifyContent='center'>
        <Button
          onClick={handleOpenAllVotes}
          sx={{ borderColor: 'secondary.light', color: theme.palette.mode === 'light' ? 'secondary.light' : 'text.primary', fontSize: '18px', fontWeight: 500, mt: '10px', textDecoration: 'underline', textTransform: 'none', width: '82%' }}
          variant='outlined'
        >
          {t('All votes')}
        </Button>
      </Grid>
      <AllVotes
        address={address}
        isFellowship={isFellowship}
        open={openAllVotes}
        refIndex={referendum?.index}
        setOpen={setOpenAllVotes}
        setVoteCountsPA={setVoteCountsPA}
        trackId={referendum?.trackId}
      />
    </Grid>
  );
}
