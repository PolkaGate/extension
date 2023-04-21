// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Groups as FellowshipIcon, HowToVote as ReferendaIcon } from '@mui/icons-material/';
import { Breadcrumbs, Button, Container, Grid, LinearProgress, Link, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { BN } from '@polkadot/util';

import { ActionContext, Infotip, PButton, ShowBalance, ShowValue } from '../../../components';
import { useApi, useChainName, useCurrentApprovalThreshold, useCurrentBlockNumber, useDecidingCount, useDecimal, useFullscreen, useToken, useTrack, useTranslation } from '../../../hooks';
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
import VoteChart from './VoteChart';

export default function ReferendumPost(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);
  const { address, postId } = useParams<{ address?: string | undefined, postId?: number | undefined }>();
  const history = useHistory();
  const { state } = useLocation();
  const api = useApi(address);
  const decidingCounts = useDecidingCount(address);
  const chainName = useChainName(address);
  const decimal = useDecimal(address);
  const token = useToken(address);
  const currentBlock = useCurrentBlockNumber(address);

  useFullscreen();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTopMenu, setSelectedTopMenu] = useState<TopMenu>();
  const [selectedSubMenu, setSelectedSubMenu] = useState<string>();
  const [referendumFromPA, setReferendum] = useState<ReferendumPolkassembly>();
  const [referendumInfoFromSubscan, setReferendumInfoFromSubscan] = useState<ReferendumSubScan>();
  const [totalIssuance, setTotalIssuance] = useState<BN>();
  const [inactiveIssuance, setInactiveIssuance] = useState<BN>();
  const [decidingProgress, setDecidingProgress] = useState<number>();
  const [passedDecisionUnit, setPassedDecisionUnit] = useState<number | null>();
  const [currentTreasuryApprovalList, setCurrentTreasuryApprovalList] = useState<Proposal[]>();

  const trackName = useMemo((): string | undefined => {
    const name = ((state?.selectedSubMenu !== 'All' && state?.selectedSubMenu) || referendumInfoFromSubscan?.origins || referendumFromPA?.origin) as string | undefined;

    return name && toTitleCase(name);
  }, [referendumFromPA?.origin, referendumInfoFromSubscan?.origins, state?.selectedSubMenu]);

  const track = useTrack(address, trackName);
  const currentApprovalThreshold = useCurrentApprovalThreshold(track?.[1], referendumInfoFromSubscan?.timeline[1]?.block);

  const ayesPercent = useMemo(() => referendumInfoFromSubscan ? Number(referendumInfoFromSubscan.ayes_amount) / (Number(referendumInfoFromSubscan.ayes_amount) + Number(new BN(referendumInfoFromSubscan.nays_amount))) * 100 : 0, [referendumInfoFromSubscan]);
  const naysPercent = useMemo(() => referendumInfoFromSubscan ? Number(referendumInfoFromSubscan.nays_amount) / (Number(referendumInfoFromSubscan.ayes_amount) + Number(new BN(referendumInfoFromSubscan.nays_amount))) * 100 : 0, [referendumInfoFromSubscan]);

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

  const supportPercent = useMemo(() => {
    if (totalIssuance && inactiveIssuance && referendumInfoFromSubscan) {
      return (Number(referendumInfoFromSubscan.support_amount) * 100 / Number(totalIssuance.sub(inactiveIssuance))).toFixed(2);
    }
  }, [inactiveIssuance, referendumInfoFromSubscan, totalIssuance]);

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

  useEffect(() => {
    if (!api) {
      return;
    }

    api.query.balances.totalIssuance().then(setTotalIssuance);

    api.query.balances.inactiveIssuance().then(setInactiveIssuance);

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

  const Tally = ({ amount, color, count, percent, text }: { text: string, percent: number, color: string, count: number, amount: string | undefined }) => (
    <Grid container item justifyContent='center' sx={{ width: '45%' }}>
      <Typography sx={{ borderBottom: `8px solid ${color}`, textAlign: 'center', fontSize: '20px', fontWeight: 500, width: '100%' }}>
        {text}
      </Typography>
      <Grid container fontSize='22px' item justifyContent='space-between'>
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
                <Grid item>
                  <Infotip iconLeft={3} iconTop={5} showQuestionMark text={'remaining time/date ...'}>
                    <Typography sx={{ fontSize: '18px', fontWeight: 400 }}>
                      <ShowValue value={decisionUnitPassed && track?.[1]?.decisionPeriod ? `${blockToUnit(track?.[1]?.decisionPeriod)} ${decisionUnitPassed} of ${blockToX(track?.[1]?.decisionPeriod, true)}` : undefined} />
                    </Typography>
                  </Infotip>
                </Grid>
              </Grid>
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
                      sx={{ height: '33px', width: '100%', bgcolor: '#DFCBD7', color: '#BA82A4', mt: '13px' }}
                      value={currentApprovalThreshold}
                      variant='determinate'
                    />
                    <Grid item fontSize='24px' fontWeight={700} pt='15px'>
                      <ShowValue value={currentApprovalThreshold && `${currentApprovalThreshold}%`} />
                    </Grid>
                  </Grid>
                </Grid>
                {/* <Grid item px='5%' xs={12}>
                  <LabelValue
                    label={`${t('Support')} (${supportPercent || ''}%)`}
                    style={{ mt: '20px' }}
                    value={<ShowBalance
                      balance={referendumInfoFromSubscan?.support_amount && new BN(referendumInfoFromSubscan.support_amount)}
                      decimal={decimal}
                      token={token}
                    />}
                  />
                  <LabelValue
                    label={t('Total issuance')}
                    value={<ShowBalance
                      balance={totalIssuance && inactiveIssuance && totalIssuance.sub(inactiveIssuance)}
                      decimal={decimal}
                      token={token}
                    />}
                  />
                </Grid> */}
                <Grid alignItems='center' container item justifyContent='space-between' sx={{ fontSize: '16px', letterSpacing: '-0.015em', my: '20px', px: '2%' }}>
                  <Grid item xs={9}>
                    {/* <LinearProgress
                      sx={{ bgcolor: 'primary.contrastText', mt: '15px' }}
                      value={decidingProgress || 0}
                      variant='determinate'
                    /> */}
                  </Grid>
                  {/* <Grid fontWeight={400} item sx={{ textAlign: 'right' }} xs>
                    {blockToX(track?.[1]?.decisionPeriod)}
                  </Grid> */}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Container>
    </>
  );
}
