// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { ArrowBackIos as ArrowBackIosIcon, Check as CheckIcon, Close as CloseIcon, RemoveCircle as AbstainIcon } from '@mui/icons-material';
import { Grid, Pagination, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { Identity, ShowBalance } from '../../../../components';
import { useApi, useChain, useDecimal, useToken, useTranslation } from '../../../../hooks';
import { DraggableModal } from '../../components/DraggableModal';
import { AbstainVoteType, AllVotesType, VoteType } from '../../utils/helpers';
import { getVoteValue } from './Amount';

interface Props {
  address: string | undefined;
  allVotes: AllVotesType | null | undefined;
  standard: VoteType | AbstainVoteType;
  open: boolean;
  closeDelegators: () => void;
  handleCloseStandards: () => void
}

const DELEGATORS_PER_PAGE = 7;

export const getVoteCapital = (vote: VoteType | AbstainVoteType) => {
  let voteTypeStr = 'abstain' in vote.balance ? 'abstain' : 'other';

  const value = voteTypeStr === 'abstain'
    ? vote.balance.abstain || new BN(vote.balance.aye).add(new BN(vote.balance.nay))
    : new BN(vote.balance.value);

  return new BN(value);
};

const sanitizeVote = (vote: string) => {
  const voteMappings: { [key: string]: string } = {
    abstain: 'Abstain',
    no: 'Nay',
    yes: 'Aye'
  };

  return voteMappings[vote.toLowerCase()];
};

export default function Delegators({ address, allVotes, closeDelegators, handleCloseStandards, open, standard }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const chain = useChain(address);
  const decimal = useDecimal(address);
  const token = useToken(address);
  const api = useApi(address);

  const [page, setPage] = React.useState<number>(1);
  const [paginationCount, setPaginationCount] = React.useState<number>(10);
  const [votesToShow, setVotesToShow] = useState<VoteType[] | AbstainVoteType[]>();

  const totalDelegatedValue = standard.votePower && standard.votePower.sub(getVoteValue(standard));

  const delegatorList = useMemo(() => allVotes && allVotes[standard.decision].votes.filter((v) => v.isDelegated && v.delegatee?.toString() === standard.voter), [allVotes, standard]);

  const capitalDelegated = useMemo(() => {
    let sum = BN_ZERO;

    for (let i = 0; i < delegatorList.length; i++) {
      sum = sum.add(new BN(delegatorList[i].balance.value));
    }

    return sum;
  }, [delegatorList]);

  useEffect(() => {
    if (delegatorList) {
      setVotesToShow(delegatorList.slice((page - 1) * DELEGATORS_PER_PAGE, page * DELEGATORS_PER_PAGE));
      setPaginationCount(Math.ceil(delegatorList.length / DELEGATORS_PER_PAGE));
    }
  }, [delegatorList, page]);

  const onBackClick = useCallback(() => {
    closeDelegators();
  }, [closeDelegators]);

  const handleClose = useCallback(() => {
    closeDelegators();
    handleCloseStandards();
  }, [closeDelegators, handleCloseStandards]);

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

  const onPageChange = useCallback((event: React.ChangeEvent<unknown>, page: number) => {
    setPage(page);
  }, []);

  const AmountVal = ({ label, value }: { label: string, value: BN | undefined }) => (
    <Grid container item spacing={1} width='225px'>
      <Grid item>
        <Typography color='text.disabled' fontSize='18px' fontWeight={400}>
          {label}
        </Typography>
      </Grid>
      <Grid fontSize='20px' fontWeight={500} item>
        <ShowBalance balance={value} decimal={decimal} decimalPoint={2} token={token} />
      </Grid>
    </Grid>
  );

  const StandardSummary = () => (
    <Grid container sx={{ borderTop: 1, borderColor: 'action.disabledBackground', py: '10px' }}>
      <Grid container item textAlign='left'>
        <Typography color='text.disabled' fontSize='20px' fontWeight={400}>
          {t('Standard')}
        </Typography>
      </Grid>
      <Grid container item sx={{ fontSize: '20', fontWeight: 500, pl: '32px' }} textAlign='left'>
        <AmountVal
          label={t('Vote')}
          value={getVoteValue(standard)}
        />
        <AmountVal
          label={t('Amount')}
          value={getVoteCapital(standard)}
        />
        {standard && standard?.lockPeriod !== null &&
          <Grid container item spacing={1} width='180px'>
            <Grid item>
              <Typography color='text.disabled' fontSize='18px' fontWeight={400}>
                {t('Conviction')}
              </Typography>
            </Grid>
            <Grid fontSize='20px' fontWeight={500} item>
              {`${standard.lockPeriod ? standard.lockPeriod : 0.1}x`}
            </Grid>
          </Grid>
        }
      </Grid>
    </Grid>);

  const DelegatedSummary = () => (
    <Grid container item sx={{ borderTop: 1, borderColor: 'action.disabledBackground', py: '7px' }}>
      <Grid container item textAlign='left'>
        <Typography color='text.disabled' fontSize='20px' fontWeight={400}>
          {t('Delegated')}
        </Typography>
      </Grid>
      <Grid container item sx={{ fontSize: '20', fontWeight: 500, pl: '32px' }} textAlign='left'>
        <AmountVal
          label={t('Vote')}
          value={totalDelegatedValue}
        />
        <AmountVal
          label={t('Amount')}
          value={capitalDelegated}
        />
      </Grid>
    </Grid>
  );

  return (
    <DraggableModal onClose={onBackClick} open={open} width={762}>
      <>
        <Grid alignItems='center' container sx={{ height: '55px' }}>
          <Grid item xs={0.3}>
            <ArrowBackIosIcon
              onClick={onBackClick}
              sx={{
                color: 'secondary.light',
                cursor: 'pointer',
                fontSize: 25,
                stroke: theme.palette.secondary.light,
                strokeWidth: 1.5
              }}
            />
          </Grid>
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
          <Grid item xs={1}>
            <CloseIcon onClick={handleClose} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
        <StandardSummary />
        <Grid container sx={{ position: 'relative' }}>
          <Grid item xs={10} sx={{ pt: '5px' }}>
            <DelegatedSummary />
          </Grid>
          <Grid alignItems='center' container item sx={{ position: 'absolute', top: '-20px', left: '600px' }} xs={2}>
            <Grid item >
              {standard.decision === 'yes'
                ? <CheckIcon sx={{ color: 'success.main', fontSize: '40px' }} />
                : standard.decision === 'no'
                  ? <CloseIcon sx={{ color: 'warning.main', fontSize: '40px' }} />
                  : <AbstainIcon sx={{ color: 'primary.light', fontSize: '40px' }} />
              }
            </Grid>
            <Grid fontSize='20px' fontWeight={400} item xs={2}>
              {sanitizeVote(standard?.decision)}
            </Grid>
          </Grid>
        </Grid>
        <Grid alignContent='flex-start' alignItems='flex-start' container justifyContent='center' sx={{ mt: '20px', position: 'relative', height: '420px', border: 1, borderColor: 'secondary.light', px: '8px', bgcolor: 'background.paper', borderRadius: '5px' }}>
          <Grid container id='table header' justifyContent='space-around' sx={{ borderBottom: 2, borderColor: 'primary.light', mb: '10px', pt: '20px', fontSize: '20px', fontWeight: 400 }}>
            <Grid item width='35%'>
              {t('Delegators ({{count}})', { replace: { count: delegatorList?.length } })}
            </Grid>
            <Grid item width='22%'>
              <vaadin-icon icon='vaadin:sort' onClick={onSortVotes} style={{ height: '20px', color: `${theme.palette.primary.main}`, cursor: 'pointer' }} />
              {t('Amount')}
            </Grid>
            <Grid item width='15%'>
              {t('Conviction')}
            </Grid>
            <Grid alignItems='center' container item justifyContent='center' width='18%'>
              <Typography fontSize='20px' width='fit-content'>
                {t('Votes')}
              </Typography>
            </Grid>
          </Grid>
          {votesToShow?.map((vote, index) => (
            <Grid alignItems='flex-start' container justifyContent='space-around' key={index} sx={{ borderBottom: 0.5, borderColor: 'secondary.contrastText', fontSize: '16px', fontWeight: 400, py: '6px' }}>
              <Grid container item justifyContent='flex-start' width='35%'>
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
                {vote.lockPeriod || 0.1}X
              </Grid>
              <Grid container item justifyContent='flex-end' width='18%'>
                <ShowBalance
                  api={api}
                  balance={new BN(vote.balance?.value || vote.balance?.abstain || vote.balance?.aye || vote.balance?.nay).muln(vote.lockPeriod || 0.1)}
                  decimal={decimal}
                  decimalPoint={2}
                  token={token}
                />
              </Grid>
            </Grid>
          ))
          }
          {votesToShow &&
            <Pagination
              count={paginationCount}
              onChange={onPageChange}
              page={page}
              sx={{ bottom: '8px', position: 'absolute' }}
              size='large'
            />
          }
        </Grid>
      </>
    </DraggableModal>
  );
}
