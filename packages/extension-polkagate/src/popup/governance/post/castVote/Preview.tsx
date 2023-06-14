// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Check as CheckIcon, Close as CloseIcon, RemoveCircle as AbstainIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { Identity, Motion, PButton, ShowBalance, TwoButtons } from '../../../../components';
import { useApi, useChain, useDecimal, useToken, useTranslation } from '../../../../hooks';
import { STATUS_COLOR } from '../../utils/consts';
import { getVoteType } from '../../utils/util';
import { getConviction, Vote } from '../myVote/util';
import DisplayValue from './partial/DisplayValue';
import { STEPS } from '.';

interface Props {
  address: string | undefined;
  vote: Vote | null | undefined
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setAlterType: React.Dispatch<React.SetStateAction<'modify' | 'remove' | undefined>>;
  cantModify: boolean;
}

export default function Preview({ address, cantModify, setAlterType, setStep, vote }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const token = useToken(address);
  const decimal = useDecimal(address);
  const chain = useChain(address);
  const api = useApi(address);
  const theme = useTheme();
  const ref = useRef(null);

  const [modalHeight, setModalHeight] = useState<number | undefined>();

  const voteType = getVoteType(vote);
  const voteBalance = vote?.standard?.balance || vote?.splitAbstain?.abstain || vote?.delegating?.balance;
  const voteConviction = useMemo(() => (vote?.standard?.vote ? `${getConviction(vote.standard.vote)}x` : vote?.delegating?.conviction ? `${vote.delegating.conviction}x` : ''), [vote]);
  const myDelegations = vote?.delegations?.votes;
  const votePower = useMemo(() => {
    const voteAmountBN = voteBalance ? new BN(voteBalance) : BN_ZERO;
    const conviction = vote?.standard
      ? getConviction(vote.standard.vote)
      : vote?.delegating
        ? getConviction(String(vote.delegating.conviction))
        : 0;
    const multipliedAmount = conviction !== 0.1 ? voteAmountBN.muln(conviction) : voteAmountBN.divn(10);

    return myDelegations ? new BN(myDelegations).add(multipliedAmount) : multipliedAmount;
  }, [myDelegations, vote, voteBalance]);

  useEffect(() => {
    if (ref) {
      setModalHeight(ref.current?.offsetHeight as number);
    }
  }, []);

  const onModifyClick = useCallback(() => {
    setStep(STEPS.INDEX);
    setAlterType('modify');
  }, [setAlterType, setStep]);

  const onRemoveClick = useCallback(() => {
    setStep(STEPS.REMOVE);
    setAlterType('remove');
  }, [setAlterType, setStep]);

  const VoteStatus = ({ vote }: { vote: 'Aye' | 'Nay' | 'Abstain' }) => {
    return (
      <Grid alignItems='center' container>
        <Grid item>
          <Typography fontSize='28px' fontWeight={500}>
            {t<string>(vote)}
          </Typography>
        </Grid>
        <Grid alignItems='center' container item width='fit-content'>
          {vote === 'Aye'
            ? <CheckIcon sx={{ color: STATUS_COLOR.Confirmed, fontSize: '28px', stroke: STATUS_COLOR.Confirmed, strokeWidth: 1.8 }} />
            : vote === 'Nay'
              ? <CloseIcon sx={{ color: 'warning.main', fontSize: '28px', stroke: theme.palette.warning.main, strokeWidth: 1.5 }} />
              : <AbstainIcon sx={{ color: 'primary.light', fontSize: '28px' }} />
          }
        </Grid>
      </Grid>
    );
  };

  return (
    <Motion style={{ height: '100%' }}>
      <Grid container pt='30px' ref={ref}>
        <DisplayValue title={t<string>('Account')} topDivider={false}>
          <Grid container fontSize='16px' fontWeight={400} item lineHeight='45px' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
            <Identity address={address} api={api} chain={chain} direction='row' identiconSize={35} showSocial={false} withShortAddress />
          </Grid>
        </DisplayValue>
        <DisplayValue title={t<string>('Vote')}>
          <VoteStatus vote={voteType} />
        </DisplayValue>
        <DisplayValue title={t<string>('Vote Value ({{token}})', { replace: { token } })}>
          <Typography fontSize='28px' fontWeight={400}>
            <ShowBalance balance={voteBalance} decimal={decimal} decimalPoint={2} token={token} />
          </Typography>
        </DisplayValue>
        {voteType && ['Aye', 'Nay'].includes(voteType) &&
          <DisplayValue title={t<string>('Vote Multiplier')}>
            <Typography fontSize='28px' fontWeight={400}>
              {voteConviction}
            </Typography>
          </DisplayValue>
        }
        <DisplayValue title={myDelegations ? t<string>('Final vote power (including delegations)') : t<string>('Final vote power')}>
          <Typography fontSize='28px' fontWeight={400}>
            <ShowBalance balance={votePower} decimal={decimal} decimalPoint={2} token={token} />
          </Typography>
        </DisplayValue>
        {cantModify
          ? <PButton
            _ml={0}
            _mt='40px'
            _onClick={onRemoveClick}
            _variant='contained'
            _width={100}
            text={t<string>('Remove')}
          />
          : <TwoButtons
            mt='40px'
            onPrimaryClick={onModifyClick}
            onSecondaryClick={onRemoveClick}
            primaryBtnText={t<string>('Modify')}
            secondaryBtnText={t<string>('Remove')}
          />
        }
      </Grid>
    </Motion>
  );
}
