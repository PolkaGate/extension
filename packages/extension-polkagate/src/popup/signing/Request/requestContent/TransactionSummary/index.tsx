// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable padding-line-between-statements */

import type { Call } from '@polkadot/types/interfaces';
// @ts-ignore
import type { PalletStakingRewardDestination } from '@polkadot/types/lookup';
import type { BN } from '@polkadot/util';

import { Stack, Typography } from '@mui/material';
import React from 'react';

import { toTitleCase } from '../../../../../util';
import AdjustStakeAmount from './AdjustStakeAmount';
import Vote from './ConvictionVotingVote';
import NominationPoolsBondExtra from './NominationPoolsBondExtra';
import Payee from './Payee';
import Transfer from './Transfer';
import TransferAll from './TransferAll';

interface Props {
  genesisHash: string;
  info: Call;
}

interface DefaultProps {
  info: Call;
}

function DefaultCase ({ info }: DefaultProps): React.ReactElement<DefaultProps> {
  return (
    <Stack columnGap='10px' direction='row' justifyContent='start'>
      <Typography color='#AA83DC' fontSize='13px' textTransform='uppercase' variant='B-2'>
        {info?.section}
      </Typography>
      <Typography color='#EAEBF1' fontSize='13px' sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '150px' }} variant='B-3'>
        {toTitleCase(info?.method)}
      </Typography>
    </Stack>
  );
}

function TransactionSummary ({ genesisHash, info }: Props): React.ReactElement<Props> {
  if (!info) {
    return (
      <DefaultCase
        info={info}
      />);
  }

  try {
    const action = `${info.section}_${info.method}`;

    switch (action) {
      case 'balances_transfer':
      case 'balances_transferKeepAlive':
        {
          if (!info.args || info.args.length < 2) {
            return <DefaultCase info={info} />;
          }

          const amount = String(info.args[1]);
          const to = String(info.args[0]);

          return (
            <Transfer
              amount={amount}
              genesisHash={genesisHash}
              to={to}
            />
          );
        }

      case 'balances_transferAll':
        {
          const to = String(info.args[0]);

          return (
            <TransferAll
              genesisHash={genesisHash}
              to={to}
            />
          );
        }

      case 'staking_bondExtra':
      case 'staking_rebond':
      case 'staking_unbond': {
        const amount = String(info.args[0]);

        return (
          <AdjustStakeAmount
            action={info?.method}
            amount={amount}
            genesisHash={genesisHash}
          />
        );
      }

      case 'staking_setPayee': {
        const payee = info.args[0] as unknown as PalletStakingRewardDestination;

        return (
          <Payee
            genesisHash={genesisHash}
            payee={payee}
          />
        );
      }

      case 'nominationPools_bondExtra': {
        const { value } = info.args[0] as unknown as { value: BN | null };

        return (
          <NominationPoolsBondExtra
            amount={value}
            genesisHash={genesisHash}
          />
        );
      }

      case 'convictionVoting_vote': {
        return (
          <Vote
            args={info.args}
            genesisHash={genesisHash}
          />
        );
      }

      default:
        return (
          <DefaultCase
            info={info}
          />
        );
    }
  } catch (e) {
    console.error('Error in TransactionSummary: ', e);

    return (
      <DefaultCase
        info={info}
      />);
  }
}

export default React.memo(TransactionSummary);
