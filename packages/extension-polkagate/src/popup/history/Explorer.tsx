// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Avatar, Link, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { CHAINS_ON_POLKAHOLIC, CHAINS_WITH_BLACK_LOGO } from '../../util/constants';
import getLogo from '../../util/getLogo';

interface Props {
  chainName: string;
  txHash: string;
  formatted?: string;
}

function getLink(chainName: string, explorer: 'subscan' | 'polkaholic' | 'statscan', type: 'account' | 'extrinsic', data: string): string {
  if (type === 'extrinsic') {
    const mayBeTheFirstPartOfChain = chainName?.split(' ')?.[0];
    const chainNameWithoutSpace = chainName?.replace(/\s/g, '');

    switch (explorer) {
      case 'subscan':
        if (chainNameWithoutSpace?.includes('AssetHub')) {
          return `https://assethub-${chainNameWithoutSpace.replace(/AssetHub/, '')}.subscan.io/extrinsic/${String(data)}`;
        }

        return 'https://' + mayBeTheFirstPartOfChain + '.subscan.io/extrinsic/' + String(data); // data here is txHash
      case 'polkaholic':
        return 'https://' + mayBeTheFirstPartOfChain + '.polkaholic.io/tx/' + String(data);
      case 'statscan':
        return 'https://westmint.statescan.io/#/accounts/' + String(data); // NOTE, data here is formatted address
    }
  }
}

export default function Explorer({ chainName, formatted, txHash }: Props): React.ReactElement {
  const theme = useTheme();
  const [explorer, setExplorer] = useState<{ name: string, link: string }>();

  const isWestmint = chainName?.replace(/\s/g, '') === 'WestendAssetHub';

  useEffect(() => {
    if (CHAINS_ON_POLKAHOLIC.includes(chainName)) {
      return setExplorer({ link: getLink(chainName, 'polkaholic', 'extrinsic', String(txHash)), name: 'polkaholic' });
    }

    if (isWestmint) {
      return setExplorer({ link: getLink(chainName, 'statscan', 'extrinsic', String(formatted)), name: 'statescan' });
    }

    setExplorer({ link: getLink(chainName, 'subscan', 'extrinsic', String(txHash)), name: 'subscan' });
  }, [chainName, formatted, isWestmint, txHash]);

  return (
    <Link href={`${explorer?.link}`} rel='noreferrer' target='_blank' underline='none'>
      <Avatar src={getLogo(explorer?.name)} sx={{ filter: (CHAINS_WITH_BLACK_LOGO.includes(explorer?.name) && theme.palette.mode === 'dark') ? 'invert(1)' : '', borderRadius: '50%', height: 40, width: 40 }} variant='square' />
    </Link>

  );
}
