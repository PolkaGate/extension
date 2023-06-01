// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { PalletRankedCollectiveTally, PalletReferendaReferendumInfoRankedCollectiveTally } from '@polkadot/types/lookup';

import { ScheduleRounded as ClockIcon } from '@mui/icons-material/';
import { Divider, Grid, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { BN } from '@polkadot/util';

import { Identity } from '../../components';
import { useApi, useChain, useChainName, useFormatted, useTrack, useTranslation } from '../../hooks';
import DecisionDeposit from './post/decisionDeposit';
import PayDecisionDeposit from './post/decisionDeposit/PayDecisionDeposit';
import VoteChart from './post/VoteChart';
import { STATUS_COLOR } from './utils/consts';
import { getReferendumPA, getReferendumSb } from './utils/helpers';
import { LatestReferenda, ReferendumPolkassembly, ReferendumSubScan } from './utils/types';
import { capitalizeFirstLetter, formalizedStatus, formatRelativeTime, pascalCaseToTitleCase } from './utils/util';

interface Props {
  address: string;
  key: number;
  onClick: () => void;
  referendum: LatestReferenda;
  myVotedReferendaIndexes: number[] | null | undefined;
}

function ReferendumSummary({ key, myVotedReferendaIndexes, onClick, referendum }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { address, topMenu } = useParams<{ address?: string | undefined, topMenu?: string | undefined }>();
  const api = useApi(address);
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const chainName = useChainName(address);
  const theme = useTheme();

  const track = useTrack(address, referendum.origin);
  const origin = referendum.origin || referendum?.fellowship_origins;
  const [openDecisionDeposit, setOpenDecisionDeposit] = useState<boolean>();
  const [referendumPA, setReferendumPA] = useState<ReferendumPolkassembly | null>();
  const [referendumSb, setReferendumSb] = useState<ReferendumSubScan | null>();
  const [onChainTally, setOnChainTally] = useState<PalletRankedCollectiveTally>();

  const ayes = useMemo(() =>
    onChainTally?.ayes?.toString() || referendumSb?.ayes_amount || referendumPA?.tally?.ayes
    , [referendumPA, referendumSb, onChainTally]);

  const nays = useMemo(() =>
    onChainTally?.nays?.toString() || referendumSb?.nays_amount || referendumPA?.tally?.nays
    , [referendumPA, referendumSb, onChainTally]);

  const amIVoted = myVotedReferendaIndexes?.includes(referendum.post_id);
  const isThisMine = referendum.proposer === formatted;
  const refIndex = referendumPA?.post_id || referendumSb?.referendum_index;

  const resultInPercent = useMemo(() => {
    if (ayes && nays) {
      const ayesBN = new BN(ayes);
      const naysBN = new BN(nays);
      const total = (Number(ayes) + Number(new BN(nays)));

      if (total === 0) {
        return;
      }

      return ayesBN.gte(naysBN)
        ? `${t('Aye')} ${parseFloat((Number(ayes) / total * 100).toFixed(2))}%`
        : `${t('Nay')} ${parseFloat((Number(nays) / total * 100).toFixed(2))}%`;
    }
  }, [ayes, nays, t]);

  useEffect(() => {
    api && refIndex && api.query.referenda?.referendumInfoFor(refIndex).then((res) => {
      const mayBeUnwrappedResult = (res.isSome && res.unwrap()) as PalletReferendaReferendumInfoRankedCollectiveTally | undefined;
      const mayBeOngoingRef = mayBeUnwrappedResult?.isOngoing && mayBeUnwrappedResult.asOngoing;
      const mayBeTally = mayBeOngoingRef ? mayBeOngoingRef.tally : undefined;

      setOnChainTally(mayBeTally);
    }).catch(console.error);
  }, [api, refIndex]);

  useEffect(() => {
    if (!referendum || !chainName || !topMenu) {
      return;
    }

    getReferendumPA(chainName, topMenu, Number(referendum.post_id)).then((res) => {
      setReferendumPA(res);
    }).catch(console.error);

    getReferendumSb(chainName, topMenu, Number(referendum.post_id)).then((res) => {
      setReferendumSb(res);
    }).catch(console.error);
  }, [chainName, referendum, topMenu]);

  return (
    <Grid item key={key} onClick={!openDecisionDeposit ? onClick : () => null} sx={{ bgcolor: 'background.paper', borderRadius: '10px', cursor: 'pointer', height: '109px', p: '0 20px', my: '13px', '&:hover': { boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)' } }}>
      <Grid container item sx={{ height: '30px' }}>
        {isThisMine &&
          <Grid item sx={{ bgcolor: 'black', color: 'text.secondary', fontSize: '12px', height: '20px', mr: '15px', textAlign: 'center', width: '85px' }}>
            {t('Mine')}
          </Grid>
        }
        {amIVoted &&
          <Grid item sx={{ bgcolor: 'black', color: 'text.secondary', fontSize: '12px', height: '20px', textAlign: 'center', width: '85px' }}>
            {t('Voted')}
          </Grid>
        }
      </Grid>
      <Grid item sx={{ fontSize: 20, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {`#${referendum.post_id}  ${referendum.title || t('No title yet')} `}
      </Grid>
      <Grid alignItems='center' container item justifyContent='space-between'>
        <Grid alignItems='center' container item xs={9.5}>
          <Grid item sx={{ fontSize: '16px', fontWeight: 400, mr: '15px' }}>
            {t('By')}:
          </Grid>
          <Grid item sx={{ maxWidth: '22%', mb: '10px' }}>
            <Identity api={api} chain={chain} formatted={referendum.proposer} identiconSize={25} showShortAddress showSocial={false} style={{ fontSize: '16px', fontWeight: 400, height: '38px', lineHeight: '47px', maxWidth: '100%', minWidth: '35%', width: 'fit-content' }} />
          </Grid>
          <Divider flexItem orientation='vertical' sx={{ mx: '2%' }} />
          {origin &&
            <>
              <Grid item sx={{ bgcolor: 'background.default', border: `1px solid ${theme.palette.primary.main} `, borderRadius: '30px', fontSize: '16px', fontWeight: 400, p: '0.5px 14.5px' }}>
                {capitalizeFirstLetter(origin.replace(/([A-Z])/g, ' $1').trim())}
              </Grid>
              <Divider flexItem orientation='vertical' sx={{ mx: '2%' }} />
            </>
          }
          <Grid item sx={{ fontSize: '16px', fontWeight: 400, opacity: 0.6, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {referendum.method}
          </Grid>
          <Divider flexItem orientation='vertical' sx={{ mx: '2%' }} />
          <ClockIcon sx={{ fontSize: 27 }} />
          <Grid item sx={{ fontSize: '16px', fontWeight: 400, pl: '1%' }}>
            {formatRelativeTime(referendum.created_at)}
          </Grid>
          {ayes && nays &&
            <>
              <Divider flexItem orientation='vertical' sx={{ mx: '2%' }} />
              <Grid item sx={{ width: '30px' }}>
                <VoteChart
                  ayes={ayes}
                  height='30px'
                  nays={nays}
                />
              </Grid>
              {resultInPercent &&
                <Grid item sx={{ pl: '5px' }}>
                  {resultInPercent}
                </Grid>
              }
            </>
          }
          {referendum.status === 'Submitted' &&
            <>
              <Divider flexItem orientation='vertical' sx={{ mx: '2%' }} />
              <Grid item sx={{ fontSize: '16px', fontWeight: 400, pl: '1%' }}>
                <PayDecisionDeposit
                  setOpenDecisionDeposit={setOpenDecisionDeposit}
                  style={{ p: 0 }}
                />
              </Grid>
            </>
          }
        </Grid>
        <Grid item sx={{ textAlign: 'center', mb: '10px', color: 'white', fontSize: '17px', fontWeight: 400, border: '1px solid primary.main', borderRadius: '30px', bgcolor: STATUS_COLOR[referendum.status], p: '5px 15px' }} xs={1.5}>
          {pascalCaseToTitleCase(formalizedStatus(referendum.status))}
        </Grid>
      </Grid>
      {openDecisionDeposit &&
        <DecisionDeposit
          address={address}
          open={openDecisionDeposit}
          refIndex={referendum.post_id}
          setOpen={setOpenDecisionDeposit}
          track={track}
        />
      }
    </Grid>
  );
}

export default React.memo(ReferendumSummary);
