// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import React, { useCallback, useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { ShowBalance } from '../../../../components';
import { useApi, useDecimal, useToken } from '../../../../hooks';
import { AbstainVoteType, AllVotesType, VoteType } from '../../utils/helpers';
import { VOTE_TYPE_MAP } from './Standards';

interface Props {
  address: string;
  vote: AbstainVoteType | VoteType;
  allVotes: AllVotesType;
  voteType: number

}

export const getVoteValue = (vote: AbstainVoteType | VoteType, voteTypeStr?: 'abstain' | 'other' | 'capital'): BN => {
  voteTypeStr = voteTypeStr || ('abstain' in vote.balance ? 'abstain' : 'other');

  const value = voteTypeStr === 'abstain'
    ? vote.balance.abstain || new BN(vote.balance.aye).add(new BN(vote.balance.nay))
    : vote.lockPeriod === 0
      ? new BN(vote.balance.value).div(new BN(10))
      : new BN(vote.balance.value).muln(vote.lockPeriod || 1);

  return new BN(value);
};

export default function Amount({ address, allVotes, vote, voteType }: Props): React.ReactElement {
  const token = useToken(address);
  const decimal = useDecimal(address);
  const api = useApi(address);

  const [amount, setAmount] = useState<BN>();

  useEffect(() => {
    const voteTypeStr = voteType === VOTE_TYPE_MAP.ABSTAIN ? 'abstain' : voteType === VOTE_TYPE_MAP.AYE ? 'yes' : 'no';

    const delegators = allVotes[voteTypeStr as keyof AllVotesType].votes.filter((v) => v.delegatee?.toString() === vote.voter);

    let sum = getVoteValue(vote, voteTypeStr);

    for (const d of delegators) {
      sum = sum.add(getVoteValue(d, 'other'));
    }

    setAmount(sum);

    const index = allVotes[voteTypeStr as keyof AllVotesType].votes.findIndex((v) => v.voter === vote.voter);

    if (index !== -1) {
      allVotes[voteTypeStr as keyof AllVotesType].votes[index].votePower = sum;
    }
  }, [allVotes, voteType, vote]);

  return (
    <ShowBalance api={api} balance={amount} decimal={decimal} decimalPoint={2} token={token} />
  );
}
