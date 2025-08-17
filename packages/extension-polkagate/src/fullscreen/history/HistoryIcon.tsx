// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ArrowCircleDown2, ArrowCircleRight2, ArrowSwapHorizontal, Data, Dislike, Like1, LikeDislike, Money, Polkadot, Record, Sagittarius, ShoppingBag, Strongbox, Strongbox2 } from 'iconsax-react';
import React, { memo } from 'react';

import { type ActionType } from '../../util';

interface Props {
  action: string
}

const HistoryIcon = ({ action }: Props) => {
  const normalizedAction = action.toLowerCase() as ActionType;

  const DEFAULT_ICON = <Polkadot color='#AA83DC' size='20' />;

  const actionIcons: Record<ActionType, React.JSX.Element> = {
    abstain: <LikeDislike color='#AA83DC' size='20' variant='Bold' />,
    aye: <Like1 color='#82FFA5' size='15' variant='Bold' />,
    balances: <ArrowSwapHorizontal color='#AA83DC' size='20' />,
    delegate: <Sagittarius color='#AA83DC' size='20' variant='Bulk' />,
    governance: <Record color='#AA83DC' size='16' variant='Bulk' />,
    nay: <Dislike color='#FF165C' size='15' variant='Bold' />,
    'pool staking': <Strongbox2 color='#AA83DC' size='20' />,
    proxy: <Data color='#AA83DC' size='14' />,
    receive: <ArrowCircleDown2 color='#82FFA5' size='16' variant='Linear' />,
    reward: <Money color='#82FFA5' size='16' />,
    send: <ArrowCircleRight2 color='#AA83DC' size='16' />,
    'solo staking': <Strongbox color='#AA83DC' size='20' />,
    utility: <ShoppingBag color='#AA83DC' size='16' />
  };

  return actionIcons[normalizedAction] || DEFAULT_ICON;
};

export default memo(HistoryIcon);
