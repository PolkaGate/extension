// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call } from '@polkadot/types/interfaces';

import { Stack, Typography } from '@mui/material';
import React from 'react';

import { toTitleCase } from '../../../../util';
import Bond from './Bond';
import Transfer from './Transfer';
import TransferAll from './TransferAll';
import Unbond from './Unbond';
import NominationPoolsBondExtra from './NominationPoolsBondExtra';
import type { BN } from '@polkadot/util';

interface Props {
  genesisHash: string;
  info: Call;
}

function TransactionSummary({ genesisHash, info }: Props): React.ReactElement<Props> {
  const action = `${info?.section}_${info?.method}`;

  switch (action) {
    case 'balances_transfer':
    case 'balances_transferKeepAlive':
      {
        const amount = String(info?.args[1]);
        const to = String(info?.args[0]);

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
        const to = String(info?.args[0]);

        return (
          <TransferAll
            genesisHash={genesisHash}
            to={to}
          />
        );
      }

    case 'staking_bondExtra': {
      const amount = String(info?.args[0]);

      return (
        <Bond
          amount={amount}
          genesisHash={genesisHash}
        />
      );
    }

    case 'nominationPools_bondExtra': {
      const { value } = info?.args[0] as unknown as { value: BN | null };

      return (
        <NominationPoolsBondExtra
          amount={value}
          genesisHash={genesisHash}
        />
      );
    }

    case 'staking_unbond': {
      const amount = String(info?.args[0]);

      return (
        <Unbond
          amount={amount}
          genesisHash={genesisHash}
        />
      );
    }

    default:
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
}

export default React.memo(TransactionSummary);
