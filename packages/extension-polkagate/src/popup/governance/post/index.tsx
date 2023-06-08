// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container, Grid } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { PButton } from '../../../components';
import { useApi, useDecidingCount, useFullscreen, useMyVote, useReferenda, useTrack, useTranslation } from '../../../hooks';
import Bread from '../Bread';
import { Header } from '../Header';
import Toolbar from '../Toolbar';
import { ENDED_STATUSES } from '../utils/consts';
import { Proposal } from '../utils/types';
import { getVoteType, toTitleCase } from '../utils/util';
import CastVote from './castVote';
import Chronology from './Chronology';
import Comments from './Comments';
import Description from './Description';
import MetaData from './MetaData';
import MyVote from './myVote';
import StatusInfo from './StatusInfo';
import Support from './Support';
import Voting from './Voting';

export default function ReferendumPost(): React.ReactElement {
  const { t } = useTranslation();
  const { address, postId, topMenu } = useParams<{ address?: string | undefined, topMenu?: 'referenda' | 'fellowship' | undefined, postId?: string | undefined }>();
  const newReferenda = useReferenda(address, topMenu, postId);

  const history = useHistory();
  const { state } = useLocation();
  const api = useApi(address);
  const decidingCounts = useDecidingCount(address);

  useFullscreen();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSubMenu, setSelectedSubMenu] = useState<string | undefined>();
  const [currentTreasuryApprovalList, setCurrentTreasuryApprovalList] = useState<Proposal[]>();
  const [showCastVote, setShowCastVote] = useState<boolean>(false);
  const [showAboutVoting, setShowAboutVoting] = useState<boolean>(false);

  const vote = useMyVote(address, postId, newReferenda?.trackId);
  const hasVoted = useMemo(() => vote && ('standard' in vote || 'splitAbstain' in vote), [vote]);
  const notVoted = useMemo(() => vote === null || (vote && !('standard' in vote || 'splitAbstain' in vote || ('delegating' in vote && vote?.delegating?.voted))), [vote]);

  const trackName = useMemo((): string | undefined => {
    const name = ((state?.selectedSubMenu !== 'All' && state?.selectedSubMenu) || newReferenda?.trackName) as string | undefined;

    return name && toTitleCase(name);
  }, [newReferenda?.trackName, state?.selectedSubMenu]);

  const track = useTrack(address, trackName);

  useEffect(() => {
    setShowAboutVoting(window.localStorage.getItem('cast_vote_about_disabled') !== 'true');
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.query.treasury.approvals().then((approvals) => {
      if (approvals.toJSON().length) {
        const approvalsIds = approvals.toJSON();

        Promise.all(
          approvals.toJSON().map((index) => api.query.treasury.proposals(index))
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

  const isOngoing = !ENDED_STATUSES.includes(newReferenda?.status);
  const cantModify = ENDED_STATUSES.includes(newReferenda?.status) && vote;
  const isAgainstOutcome = useMemo(() => {
    const voteType = getVoteType(vote);

    return voteType === 'Abstain' || (newReferenda?.status === 'Executed' && voteType === 'Nay') || (newReferenda?.status === 'Rejected' && voteType === 'Aye');
  }, [newReferenda?.status, vote]);

  return (
    <>
      <Header />
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
          subMenu={state?.selectedSubMenu || toTitleCase(newReferenda?.trackName)}
          topMenu={topMenu}
        />
        <Container disableGutters sx={{ maxHeight: parent.innerHeight - 170, maxWidth: 'inherit', opacity: menuOpen ? 0.3 : 1, overflowY: 'scroll', position: 'fixed', top: 160 }}>
          <Grid container justifyContent='space-between'>
            <Grid container item md={8.9} sx={{ height: '100%' }}>
              <Description
                address={address}
                currentTreasuryApprovalList={currentTreasuryApprovalList}
                referendum={newReferenda}
              />
              <Chronology
                address={address}
                currentTreasuryApprovalList={currentTreasuryApprovalList}
                referendum={newReferenda}
              />
              <MetaData
                address={address}
                decisionDepositPayer={newReferenda?.decisionDepositPayer}
                referendum={newReferenda}
              />
              <Comments
                address={address}
                referendum={newReferenda}
              />
            </Grid>
            <Grid container item md={2.9} sx={{ height: '100%', maxWidth: '290px' }}>
              <StatusInfo
                address={address}
                isOngoing={isOngoing}
                refIndex={newReferenda?.index}
                status={newReferenda?.status}
                timeline={newReferenda?.timelineSb}
                track={track}
              />
              <Voting
                address={address}
                referendum={newReferenda}
              />
              <Support
                address={address}
                referendum={newReferenda}
              />
              {(isOngoing || (hasVoted && isAgainstOutcome)) &&
                <Grid item sx={{ my: '15px' }} xs={12}>
                  <PButton
                    _ml={0}
                    _mt='1px'
                    _onClick={onCastVote}
                    _width={100}
                    text={hasVoted ? t<string>('Manage my Vote') : t<string>('Cast Vote')}
                  />
                </Grid>
              }
              <MyVote
                address={address}
                notVoted={notVoted}
                vote={vote}
              />
            </Grid>
          </Grid>
        </Container>
      </Container>
      {showCastVote &&
        <CastVote
          address={address}
          cantModify={cantModify}
          hasVoted={hasVoted}
          myVote={vote}
          notVoted={notVoted}
          open={showCastVote}
          refIndex={newReferenda?.index}
          setOpen={setShowCastVote}
          showAbout={showAboutVoting}
          status={newReferenda?.status}
          trackId={newReferenda?.trackId}
        />
      }
    </>
  );
}
