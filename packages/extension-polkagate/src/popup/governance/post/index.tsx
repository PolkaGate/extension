// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Groups as FellowshipIcon, HowToVote as ReferendaIcon } from '@mui/icons-material/';
import { Breadcrumbs, Button, Container, Grid, Link, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { ActionContext, Infotip, PButton, ShowValue } from '../../../components';
import { useApi, useChainName, useCurrentBlockNumber, useDecidingCount, useFullscreen, useTrack, useTranslation } from '../../../hooks';
import { Header } from '../Header';
import ReferendaMenu from '../ReferendaMenu';
import { MAX_WIDTH } from '../utils/consts';
import { getReferendum, getReferendumFromSubscan } from '../utils/helpers';
import { Proposal, ReferendumPolkassembly, ReferendumSubScan, TopMenu } from '../utils/types';
import { blockToUnit, blockToX, getPeriodScale, toTitleCase } from '../utils/util';
import Chronology from './Chronology';
import Comments from './Comments';
import Description from './Description';
import MetaData from './MetaData';
import Support from './Support';
import Voting from './Voting';

export default function ReferendumPost(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const { address, postId } = useParams<{ address?: string | undefined, postId?: number | undefined }>();
  const history = useHistory();
  const { state } = useLocation();
  const api = useApi(address);
  const decidingCounts = useDecidingCount(address);
  const chainName = useChainName(address);
  const currentBlock = useCurrentBlockNumber(address);

  useFullscreen();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTopMenu, setSelectedTopMenu] = useState<TopMenu>(state?.selectedTopMenu);
  const [selectedSubMenu, setSelectedSubMenu] = useState<string>();
  const [referendumFromPA, setReferendum] = useState<ReferendumPolkassembly>();
  const [referendumInfoFromSubscan, setReferendumInfoFromSubscan] = useState<ReferendumSubScan>();
  const [currentTreasuryApprovalList, setCurrentTreasuryApprovalList] = useState<Proposal[]>();

  const trackName = useMemo((): string | undefined => {
    const name = ((state?.selectedSubMenu !== 'All' && state?.selectedSubMenu) || referendumInfoFromSubscan?.origins || referendumFromPA?.origin) as string | undefined;

    return name && toTitleCase(name);
  }, [referendumFromPA?.origin, referendumInfoFromSubscan?.origins, state?.selectedSubMenu]);

  const track = useTrack(address, trackName);

  const decisionUnitPassed = useMemo(() => {
    if (track?.[1]?.decisionPeriod && referendumInfoFromSubscan?.timeline[1]?.block && currentBlock) {
      const decisionStartBlock = referendumInfoFromSubscan.timeline[1].block;
      const decisionPeriodInBlock = Number(track[1].decisionPeriod);
      const decisionEndBlock = decisionStartBlock + decisionPeriodInBlock;

      if (currentBlock > decisionEndBlock) {
        return null; // finished
      }

      const diff = currentBlock - decisionStartBlock;
      const unitToEndOfDecision = Math.ceil(diff / getPeriodScale(decisionPeriodInBlock));

      return unitToEndOfDecision;
    }
  }, [referendumInfoFromSubscan, track, currentBlock]);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.query.treasury.approvals().then((approvals) => {
      console.log(`approvals: ${approvals.toJSON()}`)

      if (approvals.toJSON().length) {
        const approvalsIds = approvals.toJSON();

        Promise.all(
          approvals.toJSON().map((index) => api.query.treasury.proposals(index))
        ).then((res) => {
          console.log(JSON.parse(JSON.stringify(res)));

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
      setReferendumInfoFromSubscan(res);
    });
  }, [chainName, postId]);

  const onTopMenuMenuClick = useCallback((item: TopMenu) => {
    setSelectedTopMenu(item);
    setMenuOpen(!menuOpen);
  }, [menuOpen]);

  const backToTopMenu = useCallback(() => {
    setSelectedSubMenu('All');
  }, []);

  const backToSubMenu = useCallback(() => {
    setSelectedSubMenu(state?.selectedSubMenu);
  }, [state?.selectedSubMenu]);

  const onAccountChange = useCallback((address: string) =>
    onAction(`/governance/${address}`)
    , [onAction]);

  const Toolbar = () => (
    <Grid container id='menu' sx={{ bgcolor: 'primary.main', height: '51.5px', color: 'text.secondary', fontSize: '20px', fontWeight: 500 }}>
      <Container disableGutters sx={{ maxWidth: MAX_WIDTH }}>
        <Grid alignItems='center' container justifyContent='space-between'>
          <Grid alignItems='flex-end' container item justifyContent='flex-start' md={4}>
            <TopMenu item={'Referenda'} />
            <TopMenu item={'Fellowship'} />
          </Grid>
          <Grid container item justifyContent='flex-end' md={5}>
            <Button
              // disabled={disabled}
              // onClick={_onClick}
              sx={{
                backgroundColor: 'background.paper',
                borderRadius: '5px',
                color: 'primary.main',
                fontSize: '18px',
                fontWeight: 500,
                height: '36px',
                textTransform: 'none',
                width: '190px',
                '&:hover': {
                  backgroundColor: '#fff',
                  color: '#3c52b2'
                }
              }}
              variant='contained'
            >
              Multirole Delegate
            </Button>
            <Button
              // disabled={disabled}
              // onClick={_onClick}
              sx={{
                backgroundColor: 'background.paper',
                borderRadius: '5px',
                color: 'primary.main',
                fontSize: '18px',
                fontWeight: 500,
                height: '36px',
                textTransform: 'none',
                ml: '15px',
                width: '190px',
                '&:hover': {
                  backgroundColor: '#fff',
                  color: '#3c52b2'
                }
              }}
              variant='contained'
            >
              Submit Referendum
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Grid>
  );

  function TopMenu({ item }: { item: TopMenu }): React.ReactElement<{ item: TopMenu }> {
    return (
      <Grid alignItems='center' container item justifyContent='center' onClick={() => onTopMenuMenuClick(item)} sx={{ mt: '3px', px: '5px', bgcolor: selectedTopMenu === item ? 'background.paper' : 'primary.main', color: selectedTopMenu === item ? 'primary.main' : 'text.secondary', width: '150px', height: '48px', cursor: 'pointer' }}>
        <Typography sx={{ display: 'inline-block', fontWeight: 500, fontSize: '20px' }}>
          {item}
        </Typography>
        {item === 'Fellowship'
          ? <FellowshipIcon sx={{ fontSize: 29, ml: '10px' }} />
          : <ReferendaIcon sx={{ fontSize: 29, ml: '10px', transform: 'scaleX(-1)' }} />
        }
      </Grid>
    );
  }

  const Bread = () => (
    <Grid container sx={{ py: '10px' }}>
      <Breadcrumbs aria-label='breadcrumb' color='text.primary'>
        <Link onClick={backToTopMenu} sx={{ cursor: 'pointer', fontWeight: 500 }} underline='hover'>
          {selectedTopMenu || 'Referenda'}
        </Link>
        <Link onClick={backToSubMenu} sx={{ cursor: 'pointer', fontWeight: 500 }} underline='hover'>
          {state?.selectedSubMenu}
        </Link>
        <Typography color='text.primary' sx={{ fontWeight: 500 }}>
          {`Referendum #${postId}`}
        </Typography>
      </Breadcrumbs>
    </Grid>
  );

  return (
    <>
      <Header address={address} onAccountChange={onAccountChange} />
      <Toolbar />
      {menuOpen && selectedTopMenu === 'Referenda' &&
        <ReferendaMenu decidingCounts={decidingCounts} setMenuOpen={setMenuOpen} setSelectedSubMenu={setSelectedSubMenu} />
      }
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
                referendum={referendumFromPA}
              />
              <Comments
                address={address}
                referendum={referendumFromPA}
              />
            </Grid>
            <Grid container item md={2.9} sx={{ height: '100%' }}>
              <Grid item xs={12}>
                <PButton
                  // _onClick={this.#goHome}
                  _ml={0}
                  _mt='1px'
                  _width={100}
                  text={t<string>('Vote')}
                />
              </Grid>
              <Grid alignItems='center' container item justifyContent='space-between' sx={{ p: '10px 25px', bgcolor: 'background.paper', borderRadius: '10px', mt: '10px' }} xs={12}>
                <Grid item>
                  <Typography sx={{ fontSize: '22px', fontWeight: 700 }}>
                    {t('Deciding')}
                  </Typography>
                </Grid>
                <Grid item sx={{ pr: '5px' }}>
                  <Infotip iconLeft={1} iconTop={5} showQuestionMark text={'remaining time/date ...'}>
                    <Typography sx={{ fontSize: '18px', fontWeight: 400 }}>
                      <ShowValue value={decisionUnitPassed && track?.[1]?.decisionPeriod ? `${blockToUnit(track?.[1]?.decisionPeriod)} ${decisionUnitPassed} of ${blockToX(track?.[1]?.decisionPeriod, true)}` : undefined} />
                    </Typography>
                  </Infotip>
                </Grid>
              </Grid>
              <Voting
                address={address}
                referendumFromPA={referendumFromPA}
                referendumInfoFromSubscan={referendumInfoFromSubscan}
              />
              <Support
                address={address}
                referendumFromPA={referendumFromPA}
                referendumInfoFromSubscan={referendumInfoFromSubscan}
              />
            </Grid>
          </Grid>
        </Container>
      </Container>
    </>
  );
}
