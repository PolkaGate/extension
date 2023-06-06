// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import React, { useCallback, useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { ShowBalance } from '../../../../components';
import { useApi, useDecimal, useToken } from '../../../../hooks';
import { AbstainVoteType, AllVotesType, VoteType } from '../../utils/helpers';
import { VOTE_TYPE_MAP } from './AllVotes';

interface Props {
  address: string;
  vote: AbstainVoteType | VoteType;
  nestedVotes: AllVotesType;
  voteType: number

}

export default function Amount({ address, nestedVotes, vote, voteType }: Props): React.ReactElement {
  const token = useToken(address);
  const decimal = useDecimal(address);
  const api = useApi(address);

  const [amount, setAmount] = useState<BN>();

  const getVoteValue = useCallback((voteTypeStr: 'abstain' | 'other', vote: AbstainVoteType | VoteType) => {
    const value = voteTypeStr === 'abstain'
      ? vote.balance.abstain || new BN(vote.balance.aye).add(new BN(vote.balance.nay))
      : new BN(vote.balance.value).muln(vote.lockPeriod || 0.1);

    return new BN(value);
  }, []);

  useEffect(() => {
    const voteTypeStr = voteType === VOTE_TYPE_MAP.ABSTAIN ? 'abstain' : voteType === VOTE_TYPE_MAP.AYE ? 'yes' : 'no';

    const delegators = nestedVotes[voteTypeStr as keyof AllVotesType].votes.filter((v) => v.delegatee === vote.voter);


    let sum = getVoteValue(voteTypeStr, vote);

    for (const d of delegators) {
      sum = sum.add(getVoteValue('other', d));
    }

    setAmount(sum);

    const index = nestedVotes[voteTypeStr as keyof AllVotesType].votes.findIndex((v) => v.voter === vote.voter);

    if (index !== -1) {
      nestedVotes[voteTypeStr as keyof AllVotesType].votes[index].votePower = sum;
    }
  }, [nestedVotes, voteType, vote, getVoteValue]);

  console.log('nestedVotes:', nestedVotes);

  return (
    <ShowBalance api={api} balance={amount} decimal={decimal} decimalPoint={2} token={token} />
  );
}
