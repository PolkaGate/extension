// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Check as CheckIcon, Close as CloseIcon, RemoveCircle as AbstainIcon } from '@mui/icons-material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Divider, Grid, LinearProgress, Pagination, Tab, Tabs, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Identity, Infotip2, InputFilter, Progress, ShowValue } from '../../../../components';
import { useApi, useChain, useTranslation } from '../../../../hooks';
import { DraggableModal } from '../../components/DraggableModal';
import { AbstainVoteType, AllVotesType, FilteredVotes, VoteType } from '../../utils/helpers';
import Amount from './Amount';
import { VOTE_PER_PAGE } from '.';

interface Props {
  address: string | undefined;
  allVotes: AllVotesType | null | undefined;
  filteredVotes: FilteredVotes | null | undefined;
  open: boolean;
  setShowDelegators: React.Dispatch<React.SetStateAction<VoteType | AbstainVoteType | null | undefined>>;
  setFilteredVotes: React.Dispatch<React.SetStateAction<FilteredVotes | null | undefined>>;
  handleClose: () => void;
    numberOfFetchedDelagatees: number
}

export const VOTE_TYPE_MAP = {
  AYE: 1,
  NAY: 2,
  ABSTAIN: 3
};

function noop() {
  // This function does nothing.
}

export default function Standards({ address, allVotes, filteredVotes, numberOfFetchedDelagatees, open, setFilteredVotes, handleClose, setShowDelegators }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const chain = useChain(address);
  const api = useApi(address);

  const [tabIndex, setTabIndex] = useState<number>(1);

  const [votesToShow, setVotesToShow] = useState<VoteType[] | AbstainVoteType[]>();
  const [page, setPage] = useState<number>(1);
  const [paginationCount, setPaginationCount] = useState<number>(10);
  const [amountSortType, setAmountSortType] = useState<'ASC' | 'DESC'>('ASC');
  const [isSearchBarOpen, setSearchBarOpen] = useState<boolean>(false);

  const totalNumberOfDelegators = useMemo(() => {
    if (!allVotes) {
      return undefined;
    }

    return [
      allVotes.abstain?.votes,
      allVotes.yes?.votes,
      allVotes.no?.votes
    ]
      .reduce((total, votes) => total + (votes?.filter((v) => v.isDelegated)?.length || 0), 0);
  }, [allVotes]);

  useEffect(() => {
    if (filteredVotes) {
      let votesBasedOnType = filteredVotes.yes;

      if (tabIndex === VOTE_TYPE_MAP.NAY) {
        votesBasedOnType = filteredVotes.no;
      } else if (tabIndex === VOTE_TYPE_MAP.ABSTAIN) {
        votesBasedOnType = filteredVotes.abstain;
      }

      // filter to just show standards, and delegated as nested
      votesBasedOnType = votesBasedOnType.filter((v) => !v.isDelegated);

      setVotesToShow(votesBasedOnType.slice((page - 1) * VOTE_PER_PAGE, page * VOTE_PER_PAGE));
      setPaginationCount(Math.ceil(votesBasedOnType.length / VOTE_PER_PAGE));
    }
  }, [filteredVotes, page, tabIndex]);

  const handleTabChange = useCallback((event: React.SyntheticEvent<Element, Event>, tabIndex: number) => {
    setTabIndex(tabIndex);
    setPage(1);
  }, []);

  const onSortVotes = useCallback(() => {
    setPage(1);
    setAmountSortType((prev) => prev === 'ASC' ? 'DESC' : 'ASC');

    const voteTypeStr = tabIndex === VOTE_TYPE_MAP.ABSTAIN ? 'abstain' : tabIndex === VOTE_TYPE_MAP.AYE ? 'yes' : 'no';

    filteredVotes?.[voteTypeStr]?.sort((a, b) => amountSortType === 'ASC'
      ? a?.votePower && b?.votePower && (a.votePower.sub(b.votePower)).isNeg() ? -1 : 1
      : a?.votePower && b?.votePower && (b.votePower.sub(a.votePower)).isNeg() ? -1 : 1
    );

    setFilteredVotes({ ...filteredVotes });
  }, [amountSortType, filteredVotes, setFilteredVotes, tabIndex]);

  const onPageChange = useCallback((event: React.ChangeEvent<unknown>, page: number) => {
    setPage(page);
  }, []);

  const onSearch = useCallback((filter: string) => {
    allVotes && setFilteredVotes(
      {
        abstain: allVotes.abstain.votes.filter((a) => a.voter.includes(filter) && !a.isDelegated),
        yes: allVotes.yes.votes.filter((y) => y.voter.includes(filter) && !y.isDelegated),
        no: allVotes.no.votes.filter((n) => n.voter.includes(filter) && !n.isDelegated)
      }
    );
  }, [allVotes, setFilteredVotes]);

  const openSearchBar = useCallback(() => {
    !isSearchBarOpen && setSearchBarOpen(true);
  }, [isSearchBarOpen]);

  const openDelegations = useCallback((vote: VoteType | AbstainVoteType) => {
    setShowDelegators(vote);
  }, [setShowDelegators]);

  return (
    <DraggableModal onClose={handleClose} open={open} width={762}>
      <>
        <Grid alignItems='center' container>
          <Grid item>
            <Typography fontSize='22px' fontWeight={700}>
              {t('All Votes')}
            </Typography>
          </Grid>
          <Grid item>
            <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', height: '30px', mx: '15px', opacity: 0.3, width: '2px' }} />
          </Grid>
          <Grid item onClick={openSearchBar} sx={{ cursor: 'pointer', textAlign: 'start' }} xs>
            {isSearchBarOpen
              ? <InputFilter
                autoFocus={false}
                onChange={onSearch}
                placeholder={t<string>('🔍 Search voter')}
                theme={theme}
              // value={searchKeyword ?? ''}
              />
              : <SearchIcon sx={{ color: 'rgba(0,0,0,0.2)', display: 'block', fontSize: '30px', width: 'fit-content' }} />
            }
          </Grid>
          <Grid item>
            <CloseIcon onClick={handleClose} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
        <Box>
          <Tabs centered onChange={handleTabChange} sx={{ pt: '15px', 'span.MuiTabs-indicator': { bgcolor: 'secondary.light', height: '5px', width: '100%' } }} value={tabIndex}>
            <Tab
              icon={<CheckIcon sx={{ color: 'success.main' }} />}
              iconPosition='start'
              label={t<string>('Ayes ({{ayesCount}})', { replace: { ayesCount: filteredVotes?.yes?.length || 0 } })}
              sx={{
                ':is(button.MuiButtonBase-root.MuiTab-root)': {
                  height: '49px',
                  minHeight: '49px'
                },
                ':is(button.MuiButtonBase-root.MuiTab-root.Mui-selected)': {
                  bgcolor: '#fff',
                  color: 'secondary.light',
                  fontWeight: 500
                },
                borderBlock: '5px solid',
                borderBlockColor: 'rgba(0,0,0,0.2)',
                color: 'text.primary',
                fontSize: '18px',
                fontWeight: 400,
                minWidth: '108px',
                textTransform: 'capitalize',
                width: '33%'
              }}
              value={1}
            />
            <Tab disabled icon={<Divider orientation='vertical' sx={{ backgroundColor: 'rgba(0,0,0,0.2)', height: '25px', mx: '5px', my: 'auto', width: '2px' }} />} label='' sx={{ borderBlock: '5px solid', borderBlockColor: 'rgba(0,0,0,0.2)', minWidth: '2px', p: '0', width: '2px' }} value={4} />
            <Tab
              icon={<CloseIcon sx={{ color: 'warning.main' }} />}
              iconPosition='start'
              label={t<string>('Nays ({{naysCount}})', { replace: { naysCount: filteredVotes?.no?.length || 0 } })}
              sx={{
                ':is(button.MuiButtonBase-root.MuiTab-root)': {
                  height: '49px',
                  minHeight: '49px'
                },
                ':is(button.MuiButtonBase-root.MuiTab-root.Mui-selected)': {
                  bgcolor: '#fff',
                  color: 'secondary.light',
                  fontWeight: 500
                },
                borderBlock: '5px solid',
                borderBlockColor: 'rgba(0,0,0,0.2)',
                color: 'text.primary',
                fontSize: '18px',
                fontWeight: 400,
                minWidth: '108px',
                textTransform: 'capitalize',
                width: '33%'
              }}
              value={2}
            />
            <Tab disabled icon={<Divider orientation='vertical' sx={{ backgroundColor: 'rgba(0,0,0,0.2)', height: '25px', mx: '5px', my: 'auto', width: '2px' }} />} label='' sx={{ borderBlock: '5px solid', borderBlockColor: 'rgba(0,0,0,0.2)', minWidth: '2px', p: '0', width: '2px' }} value={4} />
            <Tab
              icon={<AbstainIcon sx={{ color: 'primary.light' }} />}
              iconPosition='start'
              label={t<string>('Abstain ({{abstainsCount}})', { replace: { abstainsCount: filteredVotes?.abstain?.length || 0 } })}
              sx={{
                ':is(button.MuiButtonBase-root.MuiTab-root)': {
                  height: '49px',
                  minHeight: '49px'
                },
                ':is(button.MuiButtonBase-root.MuiTab-root.Mui-selected)': {
                  bgcolor: '#fff',
                  color: 'secondary.light',
                  fontWeight: 500
                },
                borderBlock: '5px solid',
                borderBlockColor: 'rgba(0,0,0,0.2)',
                color: 'text.primary',
                fontSize: '18px',
                fontWeight: 400,
                minWidth: '108px',
                textTransform: 'capitalize',
                width: '33%'
              }}
              value={3}
            />
          </Tabs>
        </Box>
        <Grid alignContent='flex-start' alignItems='flex-start' container justifyContent='center' sx={{ mt: '20px', position: 'relative', height: '505px' }}>
          <Grid container id='table header' justifyContent='flex-start' sx={{ borderBottom: 2, borderColor: 'primary.light', pb: '5px', fontSize: '20px', fontWeight: 400 }}>
            <Grid item width='40%'>
              {t('Voter')}
            </Grid>
            <Grid item width='30%'>
              <vaadin-icon icon='vaadin:sort' onClick={onSortVotes} style={{ height: '25px', color: `${theme.palette.primary.main}`, cursor: 'pointer' }} />
              {t('Votes')}
            </Grid>
            <Grid item width='20%'>
              <Infotip2 iconTop={7} showQuestionMark text={t('The number of delegators who have delegated their votes to this voter.')}>
                {t('Delegators')}
              </Infotip2>
            </Grid>
          </Grid>
          {allVotes &&
            <LinearProgress
              color='success'
              sx={{ height: '3px', mt: '0px', width: '100%' }}
              value={totalNumberOfDelegators ? numberOfFetchedDelagatees * 100 / totalNumberOfDelegators : 0}
              variant={numberOfFetchedDelagatees ? 'determinate' : 'indeterminate'}
            />
          }
          {votesToShow?.map((vote, index) => {
            const voteTypeStr = tabIndex === VOTE_TYPE_MAP.ABSTAIN ? 'abstain' : tabIndex === VOTE_TYPE_MAP.AYE ? 'yes' : 'no';
            const delegatorsCount = (allVotes[voteTypeStr].votes.filter((v) => v.delegatee === vote.voter)?.length || 0) as number;

            return (
              <Grid alignItems='center' container justifyContent='space-around' key={index} sx={{ borderBottom: 0.5, borderColor: 'secondary.contrastText', fontSize: '16px', fontWeight: 400 }}>
                <Grid container item justifyContent='flex-start' width='40%'>
                  <Identity
                    api={api}
                    chain={chain}
                    formatted={vote.voter}
                    identiconSize={28}
                    showShortAddress
                    showSocial={false}
                    style={{
                      fontSize: '16px',
                      fontWeight: 400,
                      maxWidth: '100%',
                      minWidth: '35%',
                      width: 'fit-content'
                    }}
                  />
                </Grid>
                <Grid container item justifyContent='flex-end' width='20%'>
                  <Amount
                    address={address}
                    allVotes={allVotes}
                    vote={vote}
                    voteType={tabIndex}
                  />
                </Grid>
                <Grid item textAlign='center' width='20%'>
                  <ShowValue value={delegatorsCount} />
                </Grid>
                <Grid alignItems='center' container justifyContent='flex-end' width='10%'>
                  <Grid item sx={{ textAlign: 'right' }}>
                    <Divider orientation='vertical' sx={{ backgroundColor: 'rgba(0,0,0,0.2)', height: '36px', mr: '3px', width: '1px' }} />
                  </Grid>
                  <Grid item sx={{ cursor: 'pointer' }} onClick={delegatorsCount ? () => openDelegations(vote) : noop}>
                    <ChevronRightIcon sx={{ color: `${delegatorsCount ? theme.palette.primary.main : theme.palette.action.disabledBackground}`, fontSize: '37px' }} />
                  </Grid>
                </Grid>
              </Grid>
            );
          })
          }
          {votesToShow &&
            <Pagination
              count={paginationCount}
              onChange={onPageChange}
              page={page}
              size='large'
              sx={{ bottom: '-18px', position: 'absolute' }}
            />
          }
          {!allVotes &&
            <Progress
              fontSize={16}
              pt={10}
              size={150}
              title={t('Loading votes ...')}
            />}
        </Grid>
      </>
    </DraggableModal>
  );
}
