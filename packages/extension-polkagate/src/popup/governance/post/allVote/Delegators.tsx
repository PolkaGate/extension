// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Check as CheckIcon, Close as CloseIcon, RemoveCircle as AbstainIcon } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Divider, Grid, Pagination, Tab, Tabs, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { Identity, Infotip2, InputFilter, Progress, ShowBalance } from '../../../../components';
import { useApi, useChain, useChainName, useDecimal, useToken, useTranslation } from '../../../../hooks';
import { DraggableModal } from '../../components/DraggableModal';
import { AbstainVoteType, AllVotesType, getAllVotesFromPA, getReferendumVotesFromSubscan, VoteType } from '../../utils/helpers';
import { getVoteValue } from './Amount';

interface Props {
  address: string | undefined;
  allVotes: AllVotesType | null | undefined
  standard: VoteType | AbstainVoteType
  open: boolean;
  closeDelegators: () => void
}

export const getVoteCapital = (vote: VoteType | AbstainVoteType) => {
  let voteTypeStr = 'abstain' in vote.balance ? 'abstain' : 'other';

  const value = voteTypeStr === 'abstain'
    ? vote.balance.abstain || new BN(vote.balance.aye).add(new BN(vote.balance.nay))
    : new BN(vote.balance.value);

  return new BN(value);
};

export default function Delegators({ address, allVotes, closeDelegators, open, standard }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const chainName = useChainName(address);
  const chain = useChain(address);
  const decimal = useDecimal(address);
  const token = useToken(address);
  const api = useApi(address);

  const [filteredVotes, setFilteredVotes] = React.useState<{ ayes: VoteType[], nays: VoteType[], abstains: AbstainVoteType[] } | null>();
  const [votesToShow, setVotesToShow] = React.useState<VoteType[] | AbstainVoteType[]>();
  const [page, setPage] = React.useState<number>(1);
  const [paginationCount, setPaginationCount] = React.useState<number>(10);
  const [amountSortType, setAmountSortType] = useState<'ASC' | 'DESC'>('ASC');
  const [isSearchBarOpen, setSearchBarOpen] = React.useState<boolean>(false)

  useEffect(() => {

  }, [chainName]);

  const handleClose = useCallback(() => {
    allVotes && setFilteredVotes({ abstains: allVotes.abstain.votes, ayes: allVotes.yes.votes, nays: allVotes.no.votes });
    closeDelegators();
  }, [allVotes, closeDelegators]);

  const openSearchBar = useCallback(() => {
    !isSearchBarOpen && setSearchBarOpen(true);
  }, [isSearchBarOpen]);

  const onSearch = useCallback((filter: string) => {
    allVotes && setFilteredVotes(
      {
        abstain: allVotes.abstain.votes.filter((a) => a.voter.includes(filter) && !a.isDelegated),
        yes: allVotes.yes.votes.filter((y) => y.voter.includes(filter) && !y.isDelegated),
        no: allVotes.no.votes.filter((n) => n.voter.includes(filter) && !n.isDelegated)
      }
    );
  }, [allVotes, setFilteredVotes]);

  const onSortVotes = useCallback(() => {
    // setPage(1);
    // setAmountSortType((prev) => prev === 'ASC' ? 'DESC' : 'ASC');

    // const voteTypeStr = tabIndex === VOTE_TYPE_MAP.ABSTAIN ? 'abstain' : tabIndex === VOTE_TYPE_MAP.AYE ? 'yes' : 'no';

    // filteredVotes?.[voteTypeStr]?.sort((a, b) => amountSortType === 'ASC'
    //   ? a?.votePower && b?.votePower && (a.votePower.sub(b.votePower)).isNeg() ? -1 : 1
    //   : a?.votePower && b?.votePower && (b.votePower.sub(a.votePower)).isNeg() ? -1 : 1
    // );

    // setFilteredVotes({ ...filteredVotes });
  }, []);

  console.log('standard:', standard);

  return (
    <DraggableModal onClose={handleClose} open={open} width={762}>
      <>
        <Grid alignItems='center' container>
          <Grid item xs={3}>
            <Typography fontSize='22px' fontWeight={700}>
              {t('Vote Details of')}
            </Typography>
          </Grid>
          <Grid item sx={{ pl: '6px' }} xs>
            <Identity
              api={api}
              chain={chain}
              formatted={standard.voter}
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
          {/* <Grid item>
            <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', opacity: 0.3, height: '30px', mx: '5px', width: '2px' }} />
          </Grid> */}
          {/* <Grid item onClick={openSearchBar} sx={{ cursor: 'pointer', px: '10px', textAlign: 'start' }} xs>
            {isSearchBarOpen
              ? <InputFilter
                autoFocus={false}
                onChange={onSearch}
                placeholder={t<string>('🔍 Search voter')}
                theme={theme}
              // value={searchKeyword ?? ''}
              />
              : <SearchIcon sx={{ color: 'rgba(0,0,0,0.2)', fontSize: '30px', width: 'fit-content' }} />
            }
          </Grid> */}
          <Grid item xs={1}>
            <CloseIcon onClick={handleClose} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
        <Grid container sx={{ borderTop: 1, borderColor: 'action.disabledBackground' }}>
          <Grid container item textAlign='left'>
            <Typography color='text.disabled' fontSize='20px' fontWeight={400}>
              {t('Standard')}
            </Typography>
          </Grid>
          <Grid container item sx={{ fontSize: '20', fontWeight: 500, pl: '32px' }} textAlign='left'>
            <Grid item>
              <ShowBalance balance={getVoteValue(standard)} decimal={decimal} token={token} />
            </Grid>
            <Grid item>
              <Typography color='text.disabled' fontSize='18px' fontWeight={400}>
                {t('Amount')}
              </Typography>
              <ShowBalance balance={getVoteCapital(standard)} decimal={decimal} token={token} />
            </Grid>
            {standard && standard?.lockPeriod !== null &&
              <Grid item>
                <Typography color='text.disabled' fontSize='18px' fontWeight={400}>
                  {t('Conviction')}
                </Typography>
                {`${standard.lockPeriod ? standard.lockPeriod : 0.1}x`}
              </Grid>
            }
          </Grid>
        </Grid>
        <Grid alignContent='flex-start' alignItems='flex-start' container justifyContent='center' sx={{ mt: '20px', position: 'relative', height: '460px' }}>
          <Grid container id='table header' justifyContent='space-around' sx={{ borderBottom: 2, borderColor: 'primary.light', mb: '10px', fontSize: '20px', fontWeight: 400 }}>
            <Grid item width='38%'>
              {t('Voter')}
            </Grid>
            <Grid item width='22%'>
              <vaadin-icon icon='vaadin:sort' onClick={onSortVotes} style={{ height: '20px', color: `${theme.palette.primary.main}`, cursor: 'pointer' }} />
              {t('Amount')}
            </Grid>
            <Grid item width='15%'>
              {t('Conviction')}
            </Grid>
            <Grid alignItems='center' container item justifyContent='center' width='12%'>
              <Infotip2 iconTop={7} showQuestionMark text={t('Delegated: representatives vote on behalf of token holders, Standard: token holders vote directly')}>
                <Typography fontSize='20px' width='fit-content'>
                  {t('Type')}
                </Typography>
              </Infotip2>
            </Grid>
          </Grid>
          {votesToShow?.map((vote, index) => (
            <Grid alignItems='flex-start' container justifyContent='space-around' key={index} sx={{ borderBottom: 0.5, borderColor: 'secondary.contrastText', fontSize: '16px', fontWeight: 400, py: '5px' }}>
              <Grid container item justifyContent='flex-start' width='38%'>
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
              <Grid container item justifyContent='center' width='22%'>
                <ShowBalance api={api} balance={vote.balance?.value || vote.balance?.abstain || vote.balance?.aye || vote.balance?.nay} decimal={decimal} decimalPoint={2} token={token} />
              </Grid>
              <Grid item width='15%'>
                {vote.lockPeriod || '0.1'}X
              </Grid>
              <Grid item sx={{ textAlign: 'right' }} width='12%'>
                {vote?.isDelegated ? t('Delegated') : t('Standard')}
              </Grid>
            </Grid>
          ))
          }
          {votesToShow &&
            <Pagination
              count={paginationCount}
              onChange={onPageChange}
              page={page}
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
    </DraggableModal >
  );
}
