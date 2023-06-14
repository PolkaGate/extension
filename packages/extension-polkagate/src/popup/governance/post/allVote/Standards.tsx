// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Check as CheckIcon, Close as CloseIcon, RemoveCircle as AbstainIcon } from '@mui/icons-material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Divider, Grid, LinearProgress, Pagination, Tab, Tabs, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Identity, InputFilter, Progress, ShowBalance } from '../../../../components';
import { useApi, useChain, useDecimal, useToken, useTranslation } from '../../../../hooks';
import { DraggableModal } from '../../components/DraggableModal';
import { AbstainVoteType, AllVotesType, FilteredVotes, VoteType } from '../../utils/helpers';
import { getVoteCapital, getVoteValue, VOTE_PER_PAGE } from '.';

interface Props {
  address: string | undefined;
  allVotes: AllVotesType | null | undefined;
  filteredVotes: FilteredVotes | null | undefined;
  open: boolean;
  setShowDelegators: React.Dispatch<React.SetStateAction<VoteType | AbstainVoteType | null | undefined>>;
  setFilteredVotes: React.Dispatch<React.SetStateAction<FilteredVotes | null | undefined>>;
  handleClose: () => void;
  numberOfFetchedDelagatees: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  page: number;
}

export const VOTE_TYPE_MAP = {
  AYE: 1,
  NAY: 2,
  // eslint-disable-next-line sort-keys
  ABSTAIN: 3
};

function noop() {
  // This function does nothing.
}

export default function Standards({ address, allVotes, filteredVotes, handleClose, numberOfFetchedDelagatees, open, page, setFilteredVotes, setPage, setShowDelegators }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const chain = useChain(address);
  const decimal = useDecimal(address);
  const token = useToken(address);
  const api = useApi(address);

  const [tabIndex, setTabIndex] = useState<number>(1);
  const [votesToShow, setVotesToShow] = useState<VoteType[] | AbstainVoteType[]>();
  const [paginationCount, setPaginationCount] = useState<number>(10);
  const [amountSortType, setAmountSortType] = useState<'ASC' | 'DESC'>();
  const [isSearchBarOpen, setSearchBarOpen] = useState<boolean>(false);

  const voteTypeStr = useMemo(() => tabIndex === VOTE_TYPE_MAP.ABSTAIN ? 'abstain' : tabIndex === VOTE_TYPE_MAP.AYE ? 'yes' : 'no', [tabIndex]);

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
    allVotes && Object.keys(allVotes).map((voteType) => {
      const standards = allVotes[voteType as keyof AllVotesType].votes.filter((v) => !v.isDelegated);

      standards.map((s: VoteType | AbstainVoteType) => {
        const delegators = allVotes[voteType as keyof AllVotesType].votes.filter((v) => v.delegatee?.toString() === s.voter) as VoteType[] | AbstainVoteType[];

        let sum = getVoteValue(s, voteType);

        for (const d of delegators) {
          sum = sum.add(getVoteValue(d, 'other'));
        }

        s.votePower = sum;
      });
    });
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

      amountSortType && votesBasedOnType.sort((a, b) => amountSortType === 'ASC'
        ? a?.votePower && b?.votePower && (a.votePower.sub(b.votePower)).isNeg() ? -1 : 1
        : a?.votePower && b?.votePower && (b.votePower.sub(a.votePower)).isNeg() ? -1 : 1
      );

      setVotesToShow(votesBasedOnType.slice((page - 1) * VOTE_PER_PAGE, page * VOTE_PER_PAGE));
      setPaginationCount(Math.ceil(votesBasedOnType.length / VOTE_PER_PAGE));
    }
  }, [amountSortType, filteredVotes, page, tabIndex]);

  const handleTabChange = useCallback((event: React.SyntheticEvent<Element, Event>, tabIndex: number) => {
    setTabIndex(tabIndex);
    setPage(1);
  }, [setPage]);

  const onSortVotes = useCallback(() => {
    setPage(1);
    setAmountSortType((prev) => prev === 'ASC' ? 'DESC' : 'ASC');
  }, [setPage]);

  const onPageChange = useCallback((event: React.ChangeEvent<unknown>, page: number) => {
    setPage(page);
  }, [setPage]);

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

  const tabStyle = {
    ':is(button.MuiButtonBase-root.MuiTab-root)': {
      height: '49px',
      minHeight: '49px'
    },
    ':is(button.MuiButtonBase-root.MuiTab-root.Mui-selected)': {
      bgcolor: 'background.paper',
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
  };

  const Header = () => (
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
            placeholder={t<string>('🔍 Search by voter address')}
            theme={theme}
          // value={searchKeyword ?? ''}
          />
          : <SearchIcon sx={{ color: 'secondary.contrastText', display: 'block', fontSize: '30px', width: 'fit-content' }} />
        }
      </Grid>
      <Grid item>
        <CloseIcon onClick={handleClose} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
      </Grid>
    </Grid>
  );

  return (
    <DraggableModal onClose={handleClose} open={open} width={762}>
      <>
        <Header />
        <Box>
          <Tabs centered onChange={handleTabChange} sx={{ pt: '15px', 'span.MuiTabs-indicator': { bgcolor: 'secondary.light', height: '5px', width: '100%' } }} value={tabIndex}>
            <Tab
              icon={<CheckIcon sx={{ color: 'success.main' }} />}
              iconPosition='start'
              label={t<string>('Ayes ({{ayesCount}})', { replace: { ayesCount: filteredVotes?.yes?.length || 0 } })}
              sx={{ ...tabStyle, width: '35%' }}
              value={1}
            />
            <Tab disabled icon={<Divider orientation='vertical' sx={{ backgroundColor: 'rgba(0,0,0,0.2)', height: '25px', mx: '5px', my: 'auto', width: '2px' }} />} label='' sx={{ borderBlock: '5px solid', borderBlockColor: 'rgba(0,0,0,0.2)', minWidth: '2px', p: '0', width: '2px' }} value={4} />
            <Tab
              icon={<CloseIcon sx={{ color: 'warning.main' }} />}
              iconPosition='start'
              label={t<string>('Nays ({{naysCount}})', { replace: { naysCount: filteredVotes?.no?.length || 0 } })}
              sx={{ ...tabStyle, width: '34%' }}
              value={2}
            />
            <Tab disabled icon={<Divider orientation='vertical' sx={{ backgroundColor: 'rgba(0,0,0,0.2)', height: '25px', mx: '5px', my: 'auto', width: '2px' }} />} label='' sx={{ borderBlock: '5px solid', borderBlockColor: 'rgba(0,0,0,0.2)', minWidth: '2px', p: '0', width: '2px' }} value={4} />
            <Tab
              icon={<AbstainIcon sx={{ color: 'primary.light' }} />}
              iconPosition='start'
              label={t<string>('Abstains ({{abstainsCount}})', { replace: { abstainsCount: filteredVotes?.abstain?.length || 0 } })}
              sx={{ ...tabStyle, width: '30%' }}
              value={3}
            />
          </Tabs>
        </Box>
        <Grid alignContent='flex-start' alignItems='flex-start' container justifyContent='center' sx={{ border: 1, borderColor: 'secondary.light', borderRadius: '10px', p: '0 8px 8px', position: 'relative', height: '555px' }}>
          <Grid alignItems='center' container id='table header' justifyContent='flex-start' sx={{ borderBottom: 2, borderColor: 'primary.light', fontSize: '17px', fontWeight: 400 }}>
            <Grid item width='35%'>
              {t('Voter')}
            </Grid>
            <Grid container item sx={{ borderLeft: 0.5, borderRight: 0.5, borderColor: 'secondary.contrastText' }} width='35%'>
              <Grid item xs={12}>
                {t('Standard Vote')}
              </Grid>
              <Grid container item justifyContent='space-around' xs={12} fontSize='16px'>
                <Grid item>
                  <vaadin-icon icon='vaadin:sort' onClick={onSortVotes} style={{ height: '25px', color: `${theme.palette.primary.main}`, cursor: 'pointer' }} />
                  {t('Value')}
                </Grid>
                {voteTypeStr !== 'abstain' &&
                  <Grid item>
                    {t('Conviction')}
                  </Grid>
                }
              </Grid>
            </Grid>
            <Grid item width='27%'>
              {t('Delegated Vote')}
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
            const totalDelegatedValue = vote.votePower && vote.votePower.sub(getVoteValue(vote));
            const hasDelegators = totalDelegatedValue && !totalDelegatedValue.isZero();

            return (
              <Grid alignItems='center' container justifyContent='space-around' key={index} sx={{ borderBottom: 0.5, borderColor: 'secondary.contrastText', fontSize: '16px', fontWeight: 400 }}>
                <Grid container item justifyContent='flex-start' width='35%'>
                  <Identity api={api} chain={chain} formatted={vote.voter} identiconSize={28} showShortAddress showSocial={false} style={{ fontSize: '16px', fontWeight: 400, maxWidth: '99%', minWidth: '35%', width: 'fit-content' }} />
                </Grid>
                <Grid alignItems='center' container item justifyContent='space-around' sx={{ borderColor: 'secondary.contrastText', borderLeft: 0.5, borderRight: 0.5, height: '43px' }} width='35%'>
                  <Grid container item justifyContent={vote?.lockPeriod == null ? 'center' : 'flex-end'} xs>
                    <ShowBalance balance={getVoteCapital(vote)} decimal={decimal} decimalPoint={2} token={token} />
                  </Grid>
                  {vote?.lockPeriod !== null &&
                    <Grid container item justifyContent='center' xs={6}>
                      {`${vote.lockPeriod ? vote.lockPeriod : 0.1}x`}
                    </Grid>
                  }
                </Grid>
                <Grid container item justifyContent='center' width='23%'>{
                  hasDelegators
                    ? <ShowBalance balance={totalDelegatedValue} decimal={decimal} decimalPoint={2} token={token} />
                    : '-'
                }
                </Grid>
                <Grid alignItems='center' container justifyContent='flex-end' width='7%'>
                  <Grid item sx={{ textAlign: 'right' }}>
                    <Divider orientation='vertical' sx={{ backgroundColor: 'rgba(0,0,0,0.2)', height: '36px', mr: '3px', width: '1px' }} />
                  </Grid>
                  <Grid item onClick={hasDelegators ? () => openDelegations(vote) : noop} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <ChevronRightIcon sx={{ color: `${hasDelegators ? theme.palette.primary.main : theme.palette.action.disabledBackground}`, fontSize: '37px' }} />
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
              sx={{ bottom: '5px', position: 'absolute' }}
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
