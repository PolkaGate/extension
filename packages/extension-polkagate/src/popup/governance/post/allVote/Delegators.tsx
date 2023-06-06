// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { ShowBalance, ShowValue } from '../../../../components';
import { useApi, useDecimal, useToken } from '../../../../hooks';
import { AbstainVoteType, AllVotesType, VoteType } from '../../utils/helpers';
import { VOTE_TYPE_MAP } from './AllVotes';

interface Props {
  address: string;
  vote: VoteType | AbstainVoteType;
  allVotes: AllVotesType;
  voteType: number

}

export default function Delegators({ address, allVotes, vote, voteType }: Props): React.ReactElement {
  const token = useToken(address);
  const decimal = useDecimal(address);
  const api = useApi(address);

  const [count, setCount] = useState<BN>();

  useEffect(() => {
    const voteTypeStr = voteType === VOTE_TYPE_MAP.ABSTAIN ? 'abstain' : voteType === VOTE_TYPE_MAP.AYE ? 'yes' : 'no';

    const delegators = allVotes[voteTypeStr].votes.filter((v) => v.delegatee === vote.voter);

    setCount(delegators?.length);
  }, [allVotes, vote.voter, voteType]);

  // console.log(`amount:${amount}`)

  return (
    <Grid container item justifyContent='center' width='22%'>
      <ShowValue value={count}  />
    </Grid>
  );
}
