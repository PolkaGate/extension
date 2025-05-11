// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import { BuyCrypto } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import { BN } from '@polkadot/util';

import { BackWithLabel, Motion } from '../../../components';
import { useBackground, useChainInfo, usePoolStakingInfo, useSelectedAccount, useTranslation } from '../../../hooks';
import { UserDashboardHeader } from '../../../partials';
import AvailableToStake from '../partial/AvailableToStake';
import StakingMenu from '../partial/StakingMenu';
import StakingPortfolio from '../partial/StakingPortfolio';

export default function Pool (): React.ReactElement {
  useBackground('staking');

  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const stakingInfo = usePoolStakingInfo(selectedAccount?.address, genesisHash);

  console.log('stakingInfo:', stakingInfo);

  const staked = useMemo(() => stakingInfo.pool === undefined ? undefined : new BN(stakingInfo.pool?.member?.points ?? 0), [stakingInfo.pool]);

  const onUnstake = useCallback(() => navigate('/pool/' + genesisHash + '/unstake') as void, [genesisHash, navigate]);
  const onBack = useCallback(() => navigate('/stakingIndex') as void, [navigate]);

  return (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader homeType='default' noAccountSelected />
        <Motion variant='slide'>
          <BackWithLabel
            onClick={onBack}
            style={{ pb: 0 }}
            text={t('pool staking')}
          />
          <StakingPortfolio
            address={selectedAccount?.address}
            buttons={[{
              Icon: BuyCrypto,
              onClick: onUnstake,
              text: t('Unstake')
            }]}
            genesisHash={genesisHash as unknown as string}
            staked={staked as unknown as BN}
            style={{ mt: '20px' }}
            type='pool'
          />
          <AvailableToStake
            availableAmount={stakingInfo.availableBalanceToStake}
            decimal={decimal}
            path={'/pool/' + genesisHash + '/bondExtra'}
            stakeType='pool'
            style={{ m: '8px auto 0', width: 'calc(100% - 30px)' }}
            token={token}
          />
        </Motion>
        <StakingMenu
          genesisHash={genesisHash ?? ''}
          type='pool'
        />
      </Grid>
    </>
  );
}
