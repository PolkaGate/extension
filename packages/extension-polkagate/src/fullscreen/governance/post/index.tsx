// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AnyJson } from '@polkadot/types-codec/types';
import type { Proposal, TopMenu } from '../utils/types';

import { Container, Grid } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { PButton } from '../../../components';
import { useApi, useChainName, useDecidingCount, useFullscreen, useMyVote, useReferendum, useTrack, useTranslation } from '../../../hooks';
import Bread from '../Bread';
import FullScreenHeader from '../FullScreenHeader';
import Toolbar from '../Toolbar';
import { ENDED_STATUSES } from '../utils/consts';
import { isFinished } from '../utils/helpers';
import { getVoteType, toTitleCase } from '../utils/util';
import CastVote from './castVote';
import Chronology from './Chronology';
import Comments from './Comments';
import Description from './Description';
import Metadata from './Metadata';
import MyVote from './myVote';
import StatusInfo from './StatusInfo';
import Support from './Support';
import Voting from './Voting';

interface LocationState {
  selectedSubMenu: string;
}

export default function ReferendumPost (): React.ReactElement {
  const { t } = useTranslation();
  const { address, postId, topMenu } = useParams<{ address?: string | undefined, topMenu?: TopMenu | undefined, postId?: string | undefined }>();
  const [refresh, setRefresh] = useState<boolean>(false);
  const referendum = useReferendum(address, topMenu, postId ? Number(postId) : undefined, refresh);

  const history = useHistory();
  const location = useLocation();
  const state = location.state as LocationState;

  const chainName = useChainName(address);
  const api = useApi(address);
  const ref = useRef('');
  const decidingCounts = useDecidingCount(address);

  useFullscreen();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSubMenu, setSelectedSubMenu] = useState<string>('');
  const [currentTreasuryApprovalList, setCurrentTreasuryApprovalList] = useState<Proposal[]>();
  const [showCastVote, setShowCastVote] = useState<boolean>(false);
  const [showAboutVoting, setShowAboutVoting] = useState<boolean>(false);

  const vote = useMyVote(address, postId, referendum?.trackId, refresh, setRefresh);
  const hasVoted = useMemo(() => vote && ('standard' in vote || 'splitAbstain' in vote), [vote]);
  const notVoted = useMemo(() => vote === null || (vote && !('standard' in vote || 'splitAbstain' in vote || ('delegating' in vote && vote?.delegating?.voted))), [vote]);

  const trackName = useMemo((): string | undefined => {
    const name = ((state?.selectedSubMenu !== 'All' && state?.selectedSubMenu) || referendum?.trackName);

    return name && toTitleCase(name);
  }, [referendum?.trackName, state?.selectedSubMenu]);

  const track = useTrack(address, trackName);

  useEffect(() => {
    setShowAboutVoting(window.localStorage.getItem('cast_vote_about_disabled') !== 'true');
  }, []);

  useEffect(() => {
    if (!chainName) {
      return;
    }

    if (!ref.current) {
      ref.current = chainName;
    } else if (ref.current !== chainName) {
      history.push({
        pathname: `/governance/${address}/${topMenu}`
      });
    }
  }, [address, chainName, history, topMenu]);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.query['treasury']?.['approvals']()
      .then((approvals) => {
        const approvalsIds = approvals?.toJSON() as AnyJson[];

        if (approvalsIds?.length) {
          Promise.all(
            approvalsIds?.map((index) => api.query['treasury']['proposals'](index))
          ).then((res) => {
            let proposals = JSON.parse(JSON.stringify(res)) as Proposal[];

            proposals = proposals.map((p, index) => {
              p.id = approvalsIds[index] as number;

              return p;
            });

            setCurrentTreasuryApprovalList(proposals);
          }).catch(console.error);
        }
      }).catch(console.error);
  }, [api]);

  useEffect(() => {
    selectedSubMenu && history.push({
      pathname: `/governance/${address}/${topMenu}`,
      state: { selectedSubMenu }
    });
  }, [address, history, selectedSubMenu, topMenu]);

  const onCastVote = useCallback(() => setShowCastVote(true), []);

  const isOngoing = !ENDED_STATUSES.includes(referendum?.status || '');
  const cantModify = ENDED_STATUSES.includes(referendum?.status || '') && vote;
  const isAgainstOutcome = useMemo(() => {
    const voteType = getVoteType(vote);

    return voteType === 'Abstain' || (referendum?.status === 'Executed' && voteType === 'Nay') || (referendum?.status === 'Rejected' && voteType === 'Aye');
  }, [referendum?.status, vote]);

  return (
    <>
      <FullScreenHeader page='governance' />
      <Toolbar
        decidingCounts={decidingCounts}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        setSelectedSubMenu={setSelectedSubMenu}
      />
      <Container disableGutters sx={{ maxWidth: 'inherit' }}>
        <Bread
          address={address}
          postId={postId}
          setSelectedSubMenu={setSelectedSubMenu}
          subMenu={toTitleCase(referendum?.trackName) || state?.selectedSubMenu || '...'}
          // @ts-ignore
          topMenu={topMenu}
        />
        <Container disableGutters sx={{ maxHeight: parent.innerHeight - 170, maxWidth: 'inherit', opacity: menuOpen ? 0.3 : 1, overflowY: 'scroll' }}>
          <Grid container justifyContent='space-between'>
            <Grid container item md={8.9} sx={{ height: '100%', ml: '5px' }}>
              <Description
                address={address}
                currentTreasuryApprovalList={currentTreasuryApprovalList}
                referendum={referendum}
              />
              <Chronology
                address={address}
                currentTreasuryApprovalList={currentTreasuryApprovalList}
                referendum={referendum}
              />
              <Metadata
                address={address}
                decisionDepositPayer={referendum?.decisionDepositPayer}
                referendum={referendum}
              />
              <Comments
                address={address}
                referendum={referendum}
              />
            </Grid>
            <Grid container item md={2.9} sx={{ height: '100%', maxWidth: '290px', mx: '5px' }}>
              {(isOngoing || (hasVoted && isAgainstOutcome)) &&
                <Grid item sx={{ mb: '10px' }} xs={12}>
                  <PButton
                    _ml={0}
                    _mt='1px'
                    _onClick={onCastVote}
                    _width={100}
                    disabled={topMenu?.toLowerCase() === 'fellowship'}
                    text={hasVoted ? t<string>('Manage my Vote') : t<string>('Cast a Vote')}
                  />
                </Grid>
              }
              <MyVote
                address={address}
                isFinished={isFinished(referendum)}
                notVoted={notVoted}
                vote={vote}
              />
              <StatusInfo
                address={address}
                isDecisionDepositPlaced={!!referendum?.decisionDepositPayer}
                isOngoing={isOngoing}
                refIndex={referendum?.index}
                status={referendum?.status}
                timeline={referendum?.timelineSb}
                track={track}
              />
              <Voting
                address={address}
                referendum={referendum}
                track={track}
              />
              <Support
                address={address}
                referendum={referendum}
                track={track}
              />
            </Grid>
          </Grid>
        </Container>
      </Container>
      {showCastVote &&
        <CastVote
          address={address}
          cantModify={!!cantModify}
          hasVoted={hasVoted}
          myVote={vote}
          notVoted={notVoted}
          open={showCastVote}
          refIndex={referendum?.index}
          setOpen={setShowCastVote}
          setRefresh={setRefresh}
          showAbout={showAboutVoting}
          status={referendum?.status}
          trackId={referendum?.trackId}
        />
      }
    </>
  );
}
