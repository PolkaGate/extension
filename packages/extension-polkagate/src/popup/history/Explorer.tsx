// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Link } from '@mui/material';
import React from 'react';

import { CHAINS_ON_POLKAHOLIC } from '../../util/constants';
import getLogo from '../../util/getLogo';

interface Props {
  chainName: string;
  txHash: string;
}

export default function Explorer({ chainName, txHash }: Props): React.ReactElement {
  const mayBeTheFirstPartOfChain = chainName?.split(' ')?.[0];
  const subscanLink = () => 'https://' + mayBeTheFirstPartOfChain + '.subscan.io/extrinsic/' + String(txHash);
  const polkaholicLink = () => 'https://' + mayBeTheFirstPartOfChain + '.polkaholic.io/tx/' + String(txHash);

  return (
    <>
      {CHAINS_ON_POLKAHOLIC.includes(chainName)
        ? <Link href={`${polkaholicLink()}`} rel='noreferrer' target='_blank' underline='none'>
          <Grid alt={'polkaholic'} component='img' src={getLogo('polkaholic')} sx={{ height: 40, width: 40 }} />
        </Link>
        : <Link href={`${subscanLink()}`} rel='noreferrer' target='_blank' underline='none'>
          <Grid alt={'subscan'} component='img' src={getLogo('subscan')} sx={{ height: 40, width: 40 }} />
        </Link>
      }
    </>
  );
}
