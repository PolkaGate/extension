// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { ArrowBackIos as ArrowBackIosIcon, Check as CheckIcon, Close as CloseIcon, RemoveCircle as AbstainIcon } from '@mui/icons-material';
import { Divider, Grid, Pagination, SxProps, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { Identity, ShowBalance } from '../../../../components';
import { useApi, useChain, useDecimal, useToken, useTranslation } from '../../../../hooks';
import { DraggableModal } from '../../components/DraggableModal';
import { AbstainVoteType, AllVotesType, VoteType } from '../../utils/helpers';
import { getVoteCapital, getVoteValue } from '.';

interface Props {
  address: string | undefined;
  allVotes: AllVotesType | null | undefined;
  standard: VoteType | AbstainVoteType;
  open: boolean;
  closeDelegators: () => void;
  handleCloseStandards: () => void
}

const DELEGATORS_PER_PAGE = 7;

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
  const [amountSortType, setAmountSortType] = useState<'ASC' | 'DESC'>();
  const [delegatorList, setDelegatorList] = useState<VoteType[] | AbstainVoteType[]>();

  const totalDelegatedValue = standard.votePower && standard.votePower.sub(getVoteValue(standard));

  const capitalDelegated = useMemo(() => {
    let sum = BN_ZERO;

    for (let i = 0; i < delegatorList?.length; i++) {
      sum = sum.add(new BN(delegatorList[i].balance.value));
    }

    return sum;
  }, [delegatorList]);

  useEffect(() => {
    if (!allVotes) {
      return;
    }

    const list = allVotes[standard.decision].votes.filter((v) => v.isDelegated && v.delegatee?.toString() === standard.voter);

    setDelegatorList(list);
  }, [allVotes, standard.decision, standard.voter]);

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
    setPage(1);
    setAmountSortType((prev) => prev === 'ASC' ? 'DESC' : 'ASC');

    delegatorList.sort((a, b) => amountSortType === 'ASC'
      ? a?.balance?.value && b?.balance?.value && (new BN(a.balance.value).sub(new BN(b.balance.value))).isNeg() ? -1 : 1
      : a?.balance?.value && b?.balance?.value && (new BN(b.balance.value).sub(new BN(a.balance.value))).isNeg() ? -1 : 1
    );
    setDelegatorList([...delegatorList]);
  }, [amountSortType, delegatorList]);

  const onPageChange = useCallback((event: React.ChangeEvent<unknown>, page: number) => {
    setPage(page);
  }, []);

  const AmountVal = ({ label, value, width = '33%', labelStyle = { fontSize: '17px', fontWeight: 400 }, valueStyle = { fontSize: '17px', fontWeight: 500 } }: { label: string, value: BN | undefined, labelStyle?: SxProps, valueStyle?: SxProps, width?: string }) => (
    <Grid alignItems='baseline' container item justifyContent='flex-start' spacing={1} width={width}>
      <Grid item>
        <Typography color='secondary.contrastText' sx={{ ...labelStyle }}>
          {label}
        </Typography>
      </Grid>
      <Grid item sx={{ ...valueStyle }}>
        <ShowBalance balance={value} decimal={decimal} decimalPoint={2} token={token} />
      </Grid>
    </Grid>
  );

  const StandardSummary = () => (
    <Grid container sx={{ pb: '10px' }}>
      <Grid container item textAlign='left' xs={2}>
        <Typography color='secondary.contrastText' fontSize='20px' fontWeight={500}>
          {t('Standard')}
        </Typography>
      </Grid>
      <Grid alignItems='baseline' container item sx={{ pl: '30px' }} textAlign='left' xs={10}>
        <AmountVal
          label={t('Vote')}
          value={getVoteValue(standard)}
        />
        <AmountVal
          label={t('Amount')}
          value={getVoteCapital(standard)}
        />
        {standard && standard?.lockPeriod !== null &&
          <Grid alignItems='baseline' justifyContent='flex-end' container item spacing={1} width='33%'>
            <Grid item>
              <Typography color='secondary.contrastText' fontSize='18px' fontWeight={400}>
                {t('Conviction')}
              </Typography>
            </Grid>
            <Grid fontSize='20px' fontWeight={500} item>
              {`${standard.lockPeriod ? standard.lockPeriod : 0.1}x`}
            </Grid>
          </Grid>
        }
      </Grid>
    </Grid>
  );

  const DelegatedSummary = () => (
    <Grid container item sx={{ py: '7px' }}>
      <Grid container item textAlign='left' xs={2}>
        <Typography color='secondary.contrastText' fontSize='20px' fontWeight={500}>
          {t('Delegated')}
        </Typography>
      </Grid>
      <Grid container item sx={{ pl: '30px' }} textAlign='left' xs={10}>
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
        <Grid alignItems='center' container sx={{ height: '55px', mb: '5px' }}>
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
          <Grid item sx={{ pl: '6px' }} xs={7.7}>
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
        <Grid container item sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'secondary.light', px: '8px', borderRadius: '5px' }}>
          <Grid alignItems='center' container item justifyContent='center' spacing={1}>
            <Grid item>
              {standard.decision === 'yes'
                ? <CheckIcon sx={{ color: 'success.main', fontSize: '40px', stroke: `${theme.palette.success.main}` }} />
                : standard.decision === 'no'
                  ? <CloseIcon sx={{ color: 'warning.main', fontSize: '38px', stroke: `${theme.palette.warning.main}` }} />
                  : <AbstainIcon sx={{ color: 'primary.light', fontSize: '30px', stroke: `${theme.palette.primary.light}` }} />
              }
            </Grid>
            <Grid fontSize='26px' fontWeight={700} item pr='10px'>
              {sanitizeVote(standard?.decision)}
            </Grid>
            <Grid item width='40%'>
              <AmountVal
                label={t('Total Vote')}
                value={totalDelegatedValue?.add(getVoteValue(standard))}
                valueStyle={{ fontSize: '26px', fontWeight: 500 }}
                width='100%'
              />
            </Grid>
          </Grid>
          <Grid item sx={{ pt: '5px' }} xs={12}>
            <Divider orientation='horizontal' sx={{ bgcolor: (theme) => theme.palette.mode === 'light' ? `rgba(${theme.palette.secondary.contrastText}, 0.2)` : 'secondary.contrastText' }} />
          </Grid>
          <Grid item sx={{ pt: '5px' }} xs={12}>
            <StandardSummary />
          </Grid>
          <Grid container item justifyContent='flex-end' sx={{ pt: '5px' }} xs={12}>
            <Divider orientation='horizontal' sx={{ bgcolor: (theme) => theme.palette.mode === 'light' ? `rgba(${theme.palette.secondary.contrastText}, 0.2)` : 'secondary.contrastText', width: '80%' }} />
          </Grid>
          <Grid item sx={{ pt: '5px' }} xs={12}>
            <DelegatedSummary />
          </Grid>
        </Grid>
        <Grid alignContent='flex-start' alignItems='flex-start' container justifyContent='center' sx={{ mt: '12px', position: 'relative', height: '420px', border: 1, borderColor: 'secondary.light', px: '8px', bgcolor: 'background.paper', borderRadius: '5px' }}>
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
            <Grid alignItems='center' container item justifyContent='flex-end' width='18%'>
              <Typography fontSize='20px' width='fit-content'>
                {t('Votes')}
              </Typography>
            </Grid>
          </Grid>
          {votesToShow?.map((vote, index) => (
            <Grid alignItems='flex-start' container justifyContent='space-around' key={index} sx={{ borderBottom: 0.5, borderColor: 'secondary.contrastText', fontSize: '16px', fontWeight: 400, py: '6px' }}>
              <Grid container item justifyContent='flex-start' width='35%'>
                <Identity api={api} chain={chain} formatted={vote.voter} identiconSize={28} showShortAddress showSocial={false} style={{ fontSize: '16px', fontWeight: 400, maxWidth: '100%', minWidth: '35%', width: 'fit-content' }} />
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
              size='large'
              sx={{ bottom: '8px', position: 'absolute' }}
            />
          }
        </Grid>
      </>
    </DraggableModal>
  );
}
