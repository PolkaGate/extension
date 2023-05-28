// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Breadcrumbs, Container, Grid, Link, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { PButton } from '../../../components';
import { useApi, useChainName, useDecidingCount, useFullscreen, useMyVote, useTrack, useTranslation } from '../../../hooks';
import { Header } from '../Header';
import Toolbar from '../Toolbar';
import { ENDED_STATUSES } from '../utils/consts';
import { getReferendum, getReferendumFromSubscan } from '../utils/helpers';
import { Proposal, ReferendumPolkassembly, ReferendumSubScan, TopMenu } from '../utils/types';
import { getVoteType, pascalCaseToTitleCase, toTitleCase } from '../utils/util';
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
  const { address, postId } = useParams<{ address?: string | undefined, postId?: string | undefined }>();
  const history = useHistory();
  const { state } = useLocation();
  const api = useApi(address);
  const decidingCounts = useDecidingCount(address);
  const chainName = useChainName(address);

  useFullscreen();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTopMenu, setSelectedTopMenu] = useState<TopMenu | undefined>(state?.selectedTopMenu);
  const [selectedSubMenu, setSelectedSubMenu] = useState<string | undefined>();
  const [referendumFromPA, setReferendum] = useState<ReferendumPolkassembly>();
  const [referendumFromSb, setReferendumFromSb] = useState<ReferendumSubScan>();
  const [currentTreasuryApprovalList, setCurrentTreasuryApprovalList] = useState<Proposal[]>();
  const [showCastVote, setShowCastVote] = useState<boolean>(false);
  const [showAboutVoting, setShowAboutVoting] = useState<boolean>(false);

  const refIndex = useMemo(() => (postId && Number(postId)) || referendumFromSb?.referendum_index || referendumFromPA?.post_id, [postId, referendumFromPA, referendumFromSb]);
  const trackId = useMemo(() => referendumFromSb?.origins_id || referendumFromPA?.track_number, [referendumFromPA, referendumFromSb]);
  const vote = useMyVote(address, refIndex, trackId);
  const hasVoted = useMemo(() => vote && ('standard' in vote || 'splitAbstain' in vote), [vote]);
  const notVoted = useMemo(() => vote === null || (vote && !('standard' in vote || 'splitAbstain' in vote || ('delegating' in vote && vote?.delegating?.voted))), [vote]);

  const trackName = useMemo((): string | undefined => {
    const name = ((state?.selectedSubMenu !== 'All' && state?.selectedSubMenu) || referendumFromSb?.origins || referendumFromPA?.origin) as string | undefined;

    return name && toTitleCase(name);
  }, [referendumFromPA?.origin, referendumFromSb?.origins, state?.selectedSubMenu]);

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
      pathname: `/governance/${address}`,
      state: { selectedSubMenu }
    });
  }, [address, history, selectedSubMenu]);

  useEffect(() => {
    chainName && postId && getReferendum(chainName, postId).then((res) => {
      setReferendum(res);
    });

    chainName && postId && getReferendumFromSubscan(chainName, postId).then((res) => {
      setReferendumFromSb(res);
    });
  }, [chainName, postId]);

  const backToTopMenu = useCallback(() => {
    setSelectedSubMenu('All');
  }, []);

  const backToSubMenu = useCallback(() => {
    setSelectedSubMenu(state?.selectedSubMenu || pascalCaseToTitleCase(referendumFromPA?.origin)?.trim());
  }, [referendumFromPA?.origin, state?.selectedSubMenu]);

  const onCastVote = useCallback(() => setShowCastVote(true), []);

  const status = useMemo(() => referendumFromPA?.status || referendumFromSb?.status, [referendumFromPA, referendumFromSb]);
  const isOngoing = !ENDED_STATUSES.includes(status);
  const cantModify = ENDED_STATUSES.includes(status) && vote;
  const isAgainstOutcome = useMemo(() => {
    const voteType = getVoteType(vote);

    return voteType === 'Abstain' || (status === 'Executed' && voteType === 'Nay') || (status === 'Rejected' && voteType === 'Aye');
  }, [status, vote]);

  const Bread = () => (
    <Grid container sx={{ py: '10px' }}>
      <Breadcrumbs aria-label='breadcrumb' color='text.primary'>
        <Link onClick={backToTopMenu} sx={{ cursor: 'pointer', fontWeight: 500 }} underline='hover'>
          {selectedTopMenu || 'Referenda'}
        </Link>
        <Link onClick={backToSubMenu} sx={{ cursor: 'pointer', fontWeight: 500 }} underline='hover'>
          {state?.selectedSubMenu || pascalCaseToTitleCase(referendumFromPA?.origin)}
        </Link>
        <Typography color='text.primary' sx={{ fontWeight: 500 }}>
          {`Referendum #${postId}`}
        </Typography>
      </Breadcrumbs>
    </Grid>
  );

  return (
    <>
      <Header />
      <Toolbar
        address={address}
        decidingCounts={decidingCounts}
        menuOpen={menuOpen}
        selectedTopMenu={state?.selectedTopMenu || selectedTopMenu || 'Referenda'}
        setMenuOpen={setMenuOpen}
        setSelectedSubMenu={setSelectedSubMenu}
        setSelectedTopMenu={setSelectedTopMenu}
      />
      <Container disableGutters sx={{ maxWidth: 'inherit' }}>
        <Bread />
        <Container disableGutters sx={{ maxHeight: parent.innerHeight - 170, maxWidth: 'inherit', opacity: menuOpen ? 0.3 : 1, overflowY: 'scroll', position: 'fixed', top: 160 }}>
          <Grid container justifyContent='space-between'>
            <Grid container item md={8.9} sx={{ height: '100%' }}>
              <Description
                address={address}
                currentTreasuryApprovalList={currentTreasuryApprovalList}
                referendum={referendumFromPA}
              />
              <Chronology
                address={address}
                currentTreasuryApprovalList={currentTreasuryApprovalList}
                referendum={referendumFromPA}
              />
              <MetaData
                address={address}
                decisionDepositPayer={referendumFromSb?.decision_deposit_account?.address}
                referendum={referendumFromPA}
              />
              <Comments
                address={address}
                referendum={referendumFromPA}
              />
            </Grid>
            <Grid container item md={2.9} sx={{ height: '100%', maxWidth: '450px' }}>
              <StatusInfo
                address={address}
                isOngoing={isOngoing}
                refIndex={refIndex}
                status={status}
                timeline={referendumFromSb?.timeline}
                track={track}
              />
              <Voting
                address={address}
                referendumFromPA={referendumFromPA}
                referendumInfoFromSubscan={referendumFromSb}
              />
              <Support
                address={address}
                referendumFromPA={referendumFromPA}
                referendumFromSb={referendumFromSb}
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
          trackId={trackId}
          status={status}
        />
      }
    </>
  );
}
