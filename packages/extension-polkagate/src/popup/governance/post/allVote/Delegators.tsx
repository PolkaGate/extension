// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { ShowValue } from '../../../../components';
import { AbstainVoteType, AllVotesType, VoteType } from '../../utils/helpers';
import { VOTE_TYPE_MAP } from './AllVotes';

interface Props {
  vote: VoteType | AbstainVoteType;
  allVotes: AllVotesType;
  voteType: number

}

export default function Delegators({ allVotes, vote, voteType }: Props): React.ReactElement {
  const [count, setCount] = useState<BN>();

  useEffect(() => {
    const voteTypeStr = voteType === VOTE_TYPE_MAP.ABSTAIN ? 'abstain' : voteType === VOTE_TYPE_MAP.AYE ? 'yes' : 'no';

    const delegators = allVotes[voteTypeStr].votes.filter((v) => v.delegatee === vote.voter);

    setCount(delegators?.length);
  }, [allVotes, vote.voter, voteType]);

  return (
    <ShowValue value={count} />
  );
}
