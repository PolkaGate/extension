// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Avatar, Grid, Link, useTheme } from '@mui/material';
import React, { useState, useEffect } from 'react';

import { CHAINS_ON_POLKAHOLIC, CHAINS_WITH_BLACK_LOGO } from '../../util/constants';
import getLogo from '../../util/getLogo';

interface Props {
  chainName: string;
  txHash: string;
  formatted?: string;
}

export default function Explorer({ chainName, formatted, txHash }: Props): React.ReactElement {
  const theme = useTheme();
  const [explorer, setExplorer] = useState<{ name: string, link: string }>();

  const mayBeTheFirstPartOfChain = chainName?.split(' ')?.[0];
  const isWestmint = chainName?.replace(/\s/g, '') === 'WestendAssetHub';

  const subscanLink = 'https://' + mayBeTheFirstPartOfChain + '.subscan.io/extrinsic/' + String(txHash);
  const polkaholicLink = 'https://' + mayBeTheFirstPartOfChain + '.polkaholic.io/tx/' + String(txHash);
  const statescanLink = 'https://westmint.statescan.io/#/accounts/' + String(formatted);

  useEffect(() => {
    if (CHAINS_ON_POLKAHOLIC.includes(chainName)) {
      return setExplorer({ link: polkaholicLink, name: 'polkaholic' });
    }

    if (isWestmint) {
      return setExplorer({ link: statescanLink, name: 'statescan' });
    }

    setExplorer({ link: subscanLink, name: 'subscan' });
  }, [chainName, isWestmint, polkaholicLink, statescanLink, subscanLink]);

  return (
    <Link href={`${explorer?.link}`} rel='noreferrer' target='_blank' underline='none'>
      <Avatar src={getLogo(explorer?.name)} sx={{ filter: (CHAINS_WITH_BLACK_LOGO.includes(explorer?.name) && theme.palette.mode === 'dark') ? 'invert(1)' : '', borderRadius: '50%', height: 40, width: 40 }} variant='square' />
    </Link>

  );
}
