// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ArrowCircleDown2, ArrowCircleRight2, ArrowSwapHorizontal, Data, Dislike, Like1, LikeDislike, Money, Polkadot, Record, Sagittarius, ShoppingBag, Strongbox, Strongbox2 } from 'iconsax-react';
import React, { memo } from 'react';

import { type ActionType } from '../../util';

interface Props {
  action: string;
  isFullscreen?: boolean;
}

const HistoryIcon = ({ action, isFullscreen = true }: Props) => {
  const normalizedAction = action.toLowerCase() as ActionType;

  const DEFAULT_ICON = <Polkadot color='#AA83DC' size={isFullscreen ? 20 : 26} />;

  const actionIcons: Record<ActionType, React.JSX.Element> = {
    abstain: <LikeDislike color='#AA83DC' size={isFullscreen ? 20 : 26} variant='Bold' />,
    aye: <Like1 color='#82FFA5' size={isFullscreen ? 15 : 22} variant='Bold' />,
    balances: <ArrowSwapHorizontal color='#AA83DC' size={isFullscreen ? 20 : 26 } />,
    delegate: <Sagittarius color='#AA83DC' size={isFullscreen ? 20 : 26} variant='Bulk' />,
    governance: <Record color='#AA83DC' size={isFullscreen ? 16 : 22} variant='Bulk' />,
    nay: <Dislike color='#FF165C' size={isFullscreen ? 15 : 26} variant='Bold' />,
    'pool staking': <Strongbox2 color='#AA83DC' size={isFullscreen ? 16 : 26} />,
    proxy: <Data color='#AA83DC' size={isFullscreen ? 14 : 20 } />,
    receive: <ArrowCircleDown2 color='#82FFA5' size={isFullscreen ? 16 : 22} variant='Linear' />,
    reward: <Money color='#82FFA5' size={isFullscreen ? 16 : 22} />,
    send: <ArrowCircleRight2 color='#AA83DC' size={isFullscreen ? 16 : 22} />,
    'solo staking': <Strongbox color='#AA83DC' size={isFullscreen ? 16 : 26} />,
    utility: <ShoppingBag color='#AA83DC' size={isFullscreen ? 16 : 22 } />
  };

  return actionIcons[normalizedAction] || DEFAULT_ICON;
};

export default memo(HistoryIcon);
