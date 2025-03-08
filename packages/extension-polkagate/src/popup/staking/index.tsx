// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import React, { useMemo } from 'react';

import { useAccountAssets, useSelectedAccount } from '../../hooks';
import EarningOptions from './EarningOptions';
import StakingPositions from './StakingPositions';

export default function StakingIndex (): React.ReactElement {
  const account = useSelectedAccount();
  const accountAssets = useAccountAssets(account?.address);

  const hasStake = useMemo(() => {
    return !!accountAssets?.find(({ pooledBalance, soloTotal }) => (soloTotal && !soloTotal.isZero()) || (pooledBalance && !pooledBalance.isZero()));
  }, [accountAssets]);

  return (
    <>
      {hasStake
        ? <StakingPositions />
        : <EarningOptions />
      }
    </>
  );
}
