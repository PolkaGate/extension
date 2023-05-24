// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { PalletRankedCollectiveTally, PalletReferendaReferendumInfoRankedCollectiveTally } from '@polkadot/types/lookup';

import { Button, Grid, LinearProgress, Typography, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { BN } from '@polkadot/util';

import { ShowBalance, ShowValue } from '../../../components';
import { useApi, useCurrentApprovalThreshold, useCurrentBlockNumber, useDecimal, useToken, useTrack, useTranslation } from '../../../hooks';
import { ReferendumPolkassembly, ReferendumSubScan } from '../utils/types';
import { toTitleCase } from '../utils/util';
import AllVotes from './AllVotes';
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
  const api = useApi(address);
  const decimal = useDecimal(address);
  const token = useToken(address);

  const currentBlock = useCurrentBlockNumber(address);
  const [openAllVotes, setOpenAllVotes] = useState(false);
  const [onChainVoteCounts, setOnChainVoteCounts] = useState<{ ayes: number | undefined, nays: number | undefined }>();
  const [VoteCountsPA, setVoteCountsPA] = useState<{ ayes: number | undefined, nays: number | undefined }>();
  const [onChainTally, setOnChainTally] = useState<PalletRankedCollectiveTally>();

  const trackId = referendumInfoFromSubscan?.origins_id;
  const refIndex = useMemo(() => referendumFromPA?.post_id || referendumInfoFromSubscan?.referendum_index, [referendumFromPA, referendumInfoFromSubscan]);

  const trackName = useMemo((): string | undefined => {
    const name = ((state?.selectedSubMenu !== 'All' && state?.selectedSubMenu) || referendumInfoFromSubscan?.origins || referendumFromPA?.origin) as string | undefined;

    return name && toTitleCase(name);
  }, [referendumFromPA?.origin, referendumInfoFromSubscan?.origins, state?.selectedSubMenu]);

  const track = useTrack(address, trackName);
  const threshold = useCurrentApprovalThreshold(track?.[1], currentBlock && referendumInfoFromSubscan && currentBlock - referendumInfoFromSubscan?.timeline[1]?.block);

  const currentApprovalThreshold = useMemo((): number | undefined => {
    if (track?.[1]?.preparePeriod && currentBlock && referendumInfoFromSubscan) {
      const blockSubmitted = referendumInfoFromSubscan.timeline[0].block;

      if (track[1].preparePeriod.gtn(currentBlock - blockSubmitted)) {
        // in prepare period
        return 100;
      }

      return threshold;
    }
  }, [currentBlock, referendumInfoFromSubscan, threshold, track]);

  const ayes = useMemo(() =>
    onChainTally?.ayes?.toString() || referendumInfoFromSubscan?.ayes_amount || referendumFromPA?.tally?.ayes
    , [referendumFromPA, referendumInfoFromSubscan, onChainTally]);

  const nays = useMemo(() =>
    onChainTally?.nays?.toString() || referendumInfoFromSubscan?.nays_amount || referendumFromPA?.tally?.nays
    , [referendumFromPA, referendumInfoFromSubscan, onChainTally]);

  const ayesCount = onChainVoteCounts?.ayes || VoteCountsPA?.ayes || referendumInfoFromSubscan?.ayes_count;
  const naysCount = onChainVoteCounts?.nays || VoteCountsPA?.nays || referendumInfoFromSubscan?.nays_count;

  const ayesPercent = useMemo(() => ayes && nays ? Number(ayes) / (Number(ayes) + Number(new BN(nays))) * 100 : 0, [nays, ayes]);
  const naysPercent = useMemo(() => ayes && nays ? Number(nays) / (Number(ayes) + Number(new BN(nays))) * 100 : 0, [nays, ayes]);

  useEffect(() => {
    api && refIndex && api.query.referenda?.referendumInfoFor(refIndex).then((res) => {
      const mayBeUnwrappedResult = (res.isSome && res.unwrap()) as PalletReferendaReferendumInfoRankedCollectiveTally | undefined;
      const mayBeOngoingRef = mayBeUnwrappedResult?.isOngoing && mayBeUnwrappedResult.asOngoing;
      const mayBeTally = mayBeOngoingRef ? mayBeOngoingRef.tally : undefined;

      setOnChainTally(mayBeTally);
      console.log('referendumInfoFor:', res.unwrap());
    }).catch(console.error);
  }, [api, refIndex]);

  const handleOpenAllVotes = () => {
    setOpenAllVotes(true);
  };

  const Tally = ({ amount, color, count, percent, text }: { text: string, percent: number, color: string, count: number | undefined, amount: string | undefined }) => (
    <Grid container item justifyContent='center' sx={{ width: '45%' }}>
      <Typography sx={{ borderBottom: `8px solid ${color}`, textAlign: 'center', fontSize: '20px', fontWeight: 500, width: '100%' }}>
        {text}
      </Typography>
      <Grid container fontSize='22px' item justifyContent='space-around'>
        <Grid fontWeight={700} item>
          {percent?.toFixed(1)}%
        </Grid>
        <Grid color='text.disabled' fontSize='20px' fontWeight={400} item>
          {count ? `(${count || ''})` : ''}
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
    <Grid alignItems='flex-start' container item sx={{ bgcolor: 'background.paper', borderRadius: '10px', pb: '20px' }}>
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
          amount={ayes}
          color={`${theme.palette.aye.main}`}
          count={ayesCount}
          percent={ayesPercent}
          text={t('Ayes')}
        />
        <Tally
          amount={nays}
          color={`${theme.palette.nay.main}`}
          count={naysCount}
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
      <Grid color='primary.main' container justifyContent='center'>
        <Button
          onClick={handleOpenAllVotes}
          // disabled={change}
          sx={{ fontSize: '18px', fontWeight: 500, mt: '10px', textTransform: 'none', textDecoration: 'underline', width: '70%' }}
          variant='text'
        >
          {t('All votes')}
        </Button>
      </Grid>
      <AllVotes
        address={address}
        open={openAllVotes}
        refIndex={refIndex}
        setOnChainVoteCounts={setOnChainVoteCounts}
        setOpen={setOpenAllVotes}
        setVoteCountsPA={setVoteCountsPA}
        trackId={trackId}
      />
    </Grid>
  );
}
