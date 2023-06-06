// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { ShowBalance } from '../../../../components';
import { useApi, useDecimal, useToken } from '../../../../hooks';
import { AbstainVoteType, AllVotesType, VoteType } from '../../utils/helpers';
import { VOTE_TYPE_MAP } from './AllVotes';

interface Props {
  address: string;
  vote: VoteType | AbstainVoteType;
  allVotes: AllVotesType;
  voteType: number

}

export default function Amount({ address, allVotes, vote, voteType }: Props): React.ReactElement {
  const token = useToken(address);
  const decimal = useDecimal(address);
  const api = useApi(address);

  const [amount, setAmount] = useState<BN>();
  const getVoteValue = useCallback((voteTypeStr: 'abstain' | 'no' | 'yes', vote: AbstainVoteType | VoteType) => {
    const value = voteTypeStr === 'abstain' ? vote.balance.abstain : vote.balance.value;

    return new BN(value);
  }, []);

  useEffect(() => {
    const voteTypeStr = voteType === VOTE_TYPE_MAP.ABSTAIN ? 'abstain' : voteType === VOTE_TYPE_MAP.AYE ? 'yes' : 'no';

    const delegators = allVotes[voteTypeStr].votes.filter((v) => v.delegatee === vote.voter);
    let sum = new BN(voteTypeStr === 'abstain' ? vote.balance.abstain : vote.balance.value);
console.log('delegators.len:', delegators?.length)
console.log('delegators:', delegators)
    for (const d of delegators) {
      sum = sum.add(new BN(d.balance.value));
    }

    setAmount(sum);
  }, [allVotes, voteType, vote, getVoteValue]);

  // console.log(`amount:${amount}`)

  return (
    <ShowBalance api={api} balance={amount} decimal={decimal} decimalPoint={2} token={token} />
  );
}
