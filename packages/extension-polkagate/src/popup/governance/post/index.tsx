// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Breadcrumbs, Container, Grid, Link, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { PButton } from '../../../components';
import { useApi, useChainName, useDecidingCount, useFullscreen, useMyVote, useTrack, useTranslation } from '../../../hooks';
import Bread from '../Bread';
import { Header } from '../Header';
import Toolbar from '../Toolbar';
import { ENDED_STATUSES } from '../utils/consts';
import { getReferendumPA, getReferendumSb } from '../utils/helpers';
import { Proposal, ReferendumPolkassembly, ReferendumSubScan, TopMenu } from '../utils/types';
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
  const { address, topMenu, postId } = useParams<{ address?: string | undefined, postId?: string | undefined }>();
  const history = useHistory();
  const { state } = useLocation();
  const api = useApi(address);
  const decidingCounts = useDecidingCount(address);
  const chainName = useChainName(address);

  useFullscreen();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSubMenu, setSelectedSubMenu] = useState<string | undefined>();
  const [referendumPA, setReferendumPA] = useState<ReferendumPolkassembly>();
  const [referendumSb, setReferendumSb] = useState<ReferendumSubScan>();
  const [currentTreasuryApprovalList, setCurrentTreasuryApprovalList] = useState<Proposal[]>();
  const [showCastVote, setShowCastVote] = useState<boolean>(false);
  const [showAboutVoting, setShowAboutVoting] = useState<boolean>(false);

  const refIndex = useMemo(() => (postId && Number(postId)) || referendumSb?.referendum_index || referendumPA?.post_id, [postId, referendumPA, referendumSb]);
  const trackId = useMemo(() => referendumSb?.origins_id || referendumPA?.track_number, [referendumPA, referendumSb]);
  const vote = useMyVote(address, refIndex, trackId);
  const hasVoted = useMemo(() => vote && ('standard' in vote || 'splitAbstain' in vote), [vote]);
  const notVoted = useMemo(() => vote === null || (vote && !('standard' in vote || 'splitAbstain' in vote || ('delegating' in vote && vote?.delegating?.voted))), [vote]);

  const trackName = useMemo((): string | undefined => {
    const name = ((state?.selectedSubMenu !== 'All' && state?.selectedSubMenu) || referendumSb?.origins || referendumPA?.origin) as string | undefined;

    return name && toTitleCase(name);
  }, [referendumPA?.origin, referendumSb?.origins, state?.selectedSubMenu]);

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

  useEffect(() => {
    if (!chainName || !postId) {
      return;
    }

    getReferendumPA(chainName, topMenu, Number(postId)).then((res) => {
      setReferendumPA(res);
    }).catch(console.error);

    getReferendumSb(chainName, topMenu, Number(postId)).then((res) => {
      setReferendumSb(res);
    }).catch(console.error);
  }, [chainName, postId, selectedSubMenu, topMenu]);

  const onCastVote = useCallback(() => setShowCastVote(true), []);

  const status = useMemo(() => referendumPA?.status || referendumSb?.status, [referendumPA, referendumSb]);
  const isOngoing = !ENDED_STATUSES.includes(status);
  const cantModify = ENDED_STATUSES.includes(status) && vote;
  const isAgainstOutcome = useMemo(() => {
    const voteType = getVoteType(vote);

    return voteType === 'Abstain' || (status === 'Executed' && voteType === 'Nay') || (status === 'Rejected' && voteType === 'Aye');
  }, [status, vote]);

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
          subMenu={state?.selectedSubMenu || toTitleCase(referendumPA?.origin || referendumSb?.origins)}
          topMenu={topMenu}
        />
        <Container disableGutters sx={{ maxHeight: parent.innerHeight - 170, maxWidth: 'inherit', opacity: menuOpen ? 0.3 : 1, overflowY: 'scroll', position: 'fixed', top: 160 }}>
          <Grid container justifyContent='space-between'>
            <Grid container item md={8.9} sx={{ height: '100%' }}>
              <Description
                address={address}
                currentTreasuryApprovalList={currentTreasuryApprovalList}
                referendum={referendumPA}
              />
              <Chronology
                address={address}
                currentTreasuryApprovalList={currentTreasuryApprovalList}
                referendum={referendumPA}
              />
              <MetaData
                address={address}
                decisionDepositPayer={referendumSb?.decision_deposit_account?.address}
                referendum={referendumPA}
              />
              <Comments
                address={address}
                referendum={referendumPA}
              />
            </Grid>
            <Grid container item md={2.9} sx={{ height: '100%', maxWidth: '450px' }}>
              <StatusInfo
                address={address}
                isOngoing={isOngoing}
                refIndex={refIndex}
                status={status}
                timeline={referendumSb?.timeline}
                track={track}
              />
              <Voting
                address={address}
                referendumPA={referendumPA}
                referendumSb={referendumSb}
              />
              <Support
                address={address}
                referendumPA={referendumPA}
                referendumSb={referendumSb}
              />
              {(isOngoing || isAgainstOutcome) &&
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
          refIndex={refIndex}
          setOpen={setShowCastVote}
          showAbout={showAboutVoting}
          status={status}
          trackId={trackId}
        />
      }
    </>
  );
}
