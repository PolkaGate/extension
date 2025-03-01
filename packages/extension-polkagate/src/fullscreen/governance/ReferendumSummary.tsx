// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { LatestReferenda, TopMenu } from './utils/types';

import { OpenInNewRounded as OpenInNewIcon, ScheduleRounded as ClockIcon } from '@mui/icons-material/';
import { Divider, Grid, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';

import { noop } from '@polkadot/util';

import { Identity } from '../../components';
import { useApi, useChain, useFormatted, useReferendum, useTrack, useTranslation } from '../../hooks';
import { windowOpen } from '../../messaging';
import { isHexToBn, pgBoxShadow } from '../../util/utils';
import DecisionDeposit from './post/decisionDeposit';
import PayDecisionDeposit from './post/decisionDeposit/PayDecisionDeposit';
import VoteChart from './post/VoteChart';
import { ENDED_STATUSES, STATUS_COLOR } from './utils/consts';
import { capitalizeFirstLetter, formalizedStatus, formatRelativeTime, pascalCaseToTitleCase } from './utils/util';

interface Props {
  key: number;
  refSummary: LatestReferenda;
  myVotedReferendaIndexes: number[] | null | undefined;
}

const VerticalBar = () => (
  <Grid item mx='1.5%'>
    <Divider flexItem orientation='vertical' sx={{ bgcolor: 'divider', height: '34px' }} />
  </Grid>
);

function ReferendumSummary({ key, myVotedReferendaIndexes, refSummary }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const history = useHistory();

  const { address, topMenu } = useParams<{ address?: string | undefined, topMenu?: TopMenu | undefined }>();
  const newReferendum = useReferendum(address, topMenu, refSummary?.post_id, undefined, true, ENDED_STATUSES.includes(refSummary.status), true);
  const api = useApi(address);
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const theme = useTheme();

  const track = useTrack(address, refSummary.origin);
  const origin = refSummary.origin || refSummary?.fellowship_origins;
  const [openDecisionDeposit, setOpenDecisionDeposit] = useState<boolean>();

  const amIVoted = myVotedReferendaIndexes?.includes(refSummary.post_id);
  const isThisMine = refSummary.proposer === formatted;

  const resultInPercent = useMemo(() => {
    if (newReferendum?.ayesAmount && newReferendum?.naysAmount) {
      const ayesBN = isHexToBn(newReferendum?.ayesAmount);
      const naysBN = isHexToBn(newReferendum?.naysAmount);
      const total = (Number(ayesBN) + Number(naysBN));

      if (total === 0) {
        return;
      }

      return ayesBN.gte(naysBN)
        ? `${t('Aye')} ${parseFloat((Number(newReferendum?.ayesAmount) / total * 100).toFixed(2))}%`
        : `${t('Nay')} ${parseFloat((Number(newReferendum?.naysAmount) / total * 100).toFixed(2))}%`;
    }

    return undefined;
  }, [newReferendum, t]);

  const openReferendum = useCallback(() => {
    address && history.push({
      pathname: `/governance/${address}/${refSummary.type === 'ReferendumV2' ? 'referenda' : 'fellowship'}/${refSummary.post_id}`,
    });
  }, [address, history, refSummary.post_id, refSummary.type]);

  const openInNewTab = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    address && windowOpen(`/governance/${address}/${refSummary.type === 'ReferendumV2' ? 'referenda' : 'fellowship'}/${refSummary.post_id}`).catch(console.error);
  }, [address, refSummary.post_id, refSummary.type]);

  return (
    <Grid container item key={key} onClick={!openDecisionDeposit ? openReferendum : noop} sx={{ '&:hover': { boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)' }, bgcolor: 'background.paper', borderRadius: '10px', boxShadow: theme.palette.mode === 'light' ? pgBoxShadow(theme) : undefined, cursor: 'pointer', height: '109px', my: '13px', p: '0 20px', position: 'relative' }}>
      <Grid container item sx={{ height: '30px' }}>
        {isThisMine &&
          <Grid item sx={{ bgcolor: 'text.primary', color: 'label.main', fontSize: '12px', height: '20px', mr: '15px', textAlign: 'center', width: '85px' }}>
            {t('Mine')}
          </Grid>
        }
        {amIVoted &&
          <Grid item sx={{ bgcolor: 'text.primary', color: 'label.main', fontSize: '12px', height: '20px', textAlign: 'center', width: '85px' }}>
            {t('Voted')}
          </Grid>
        }
        <Grid item onClick={openInNewTab}>
          <OpenInNewIcon sx={{ color: 'secondary.light', cursor: 'alias', fontSize: 23, position: 'absolute', right: '5px', top: '5px' }} />
        </Grid>
      </Grid>
      <Grid item sx={{ fontSize: 20, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {`#${refSummary.post_id}  ${refSummary.title || t('No title yet')} `}
      </Grid>
      <Grid alignItems='center' container item justifyContent='space-between'>
        <Grid alignItems='center' container item xs>
          <Grid item sx={{ fontSize: '16px', fontWeight: 400, mr: '10px' }}>
            {t('By')}:
          </Grid>
          <Grid item sx={{ maxWidth: '22%', mb: '10px' }}>
            <Identity api={api} chain={chain} formatted={refSummary.proposer} identiconSize={25} showShortAddress showSocial={false} style={{ fontSize: '16px', fontWeight: 400, height: '38px', lineHeight: '47px', maxWidth: '100%', minWidth: '35%', width: 'fit-content' }} />
          </Grid>
          <VerticalBar />
          {origin &&
            <>
              <Grid item sx={{ bgcolor: 'background.default', border: `1px solid ${theme.palette.divider} `, borderRadius: '30px', fontSize: '16px', fontWeight: 400, p: '0.5px 14.5px' }}>
                {capitalizeFirstLetter(origin.replace(/([A-Z])/g, ' $1').trim())}
              </Grid>
              <VerticalBar />
            </>
          }
          <Grid item sx={{ fontSize: '16px', fontWeight: 400, opacity: 0.6, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {refSummary.method}
          </Grid>
          <VerticalBar />
          <ClockIcon sx={{ fontSize: 27 }} />
          <Grid item sx={{ fontSize: '16px', fontWeight: 400, pl: '1%' }}>
            {formatRelativeTime(refSummary.created_at)}
          </Grid>
          {newReferendum?.ayesAmount && newReferendum?.naysAmount &&
            <>
              <VerticalBar />
              <Grid item sx={{ width: '30px' }}>
                <VoteChart
                  ayes={newReferendum.ayesAmount}
                  height='30px'
                  nays={newReferendum.naysAmount}
                  noBorderColor
                  showTooltip={false}
                />
              </Grid>
              {resultInPercent &&
                <Grid item sx={{ pl: '5px' }}>
                  {resultInPercent}
                </Grid>
              }
            </>
          }
          {refSummary.status === 'Submitted' &&
            <>
              <VerticalBar />
              <Grid item sx={{ fontSize: '16px', fontWeight: 400, pl: '5px' }}>
                <PayDecisionDeposit
                  setOpenDecisionDeposit={setOpenDecisionDeposit}
                  style={{ p: 0 }}
                />
              </Grid>
            </>
          }
        </Grid>
        <Grid item sx={{ bgcolor: STATUS_COLOR[refSummary.status], border: '1px solid primary.main', borderRadius: '30px', color: 'white', fontSize: '17px', fontWeight: 400, height: '27px', textAlign: 'center', mb: '10px', px: '10px', minWidth: '119px', width: 'fit-content' }}>
          {pascalCaseToTitleCase(formalizedStatus(refSummary.status))}
        </Grid>
      </Grid>
      {openDecisionDeposit &&
        <DecisionDeposit
          address={address}
          open={openDecisionDeposit}
          refIndex={newReferendum?.index}
          setOpen={setOpenDecisionDeposit}
          track={track}
        />
      }
    </Grid>
  );
}

export default React.memo(ReferendumSummary);
