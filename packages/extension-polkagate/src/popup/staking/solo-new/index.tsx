// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container, Grid } from '@mui/material';
import { Award, BuyCrypto, Graph, LockSlash, Moneys, Strongbox2, Timer, Timer1, Trade } from 'iconsax-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { type BN, noop } from '@polkadot/util';

import { BackWithLabel, Motion } from '../../../components';
import { useChainInfo, useSelectedAccount, useSoloStakingInfo, useTranslation } from '../../../hooks';
import UserDashboardHeader from '../../../partials/UserDashboardHeader';
import AvailableToStake from '../partial/AvailableToStake';
import StakingInfoTile from '../partial/StakingInfoTile';
import StakingPortfolio from '../partial/StakingPortfolio';
import ToBeReleased from '../partial/ToBeReleased';

export default function Solo(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const stakingInfo = useSoloStakingInfo(selectedAccount?.address, genesisHash);
  const { decimal, token } = useChainInfo(genesisHash);

  const [unstakingMenu, setUnstakingMenu] = useState<boolean>(false);

  const staked = useMemo(() => stakingInfo.stakingAccount?.stakingLedger.active, [stakingInfo.stakingAccount?.stakingLedger.active]);
  const redeemable = useMemo(() => stakingInfo.stakingAccount?.redeemable, [stakingInfo.stakingAccount?.redeemable]);
  const toBeReleased = useMemo(() => stakingInfo.sessionInfo?.toBeReleased, [stakingInfo.sessionInfo?.toBeReleased]);
  const unlockingAmount = useMemo(() => stakingInfo.sessionInfo?.unlockingAmount, [stakingInfo.sessionInfo?.unlockingAmount]);
  const rewards = useMemo(() => stakingInfo.rewards, [stakingInfo.rewards]);

  const StakingInfoTileCount = [redeemable, rewards, unlockingAmount].filter((amount) => !amount?.isZero()).length; // bigger than 2 means the tile must be displayed in a row
  const layoutDirection = useMemo((): 'row' | 'column' => {
    if (StakingInfoTileCount > 2) {
      return 'row';
    } else {
      return 'column';
    }
  }, [StakingInfoTileCount]);

  const onExpand = useCallback(() => setUnstakingMenu(true), []);
  const handleCloseMenu = useCallback(() => setUnstakingMenu(false), []);
  const onBack = useCallback(() => navigate('/stakingIndex'), [navigate]);

  return (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader homeType='default' noAccountSelected />
        <Motion variant='slide'>
          <BackWithLabel
            onClick={onBack}
            style={{ pb: 0 }}
            text={t('solo staking')}
          />
          <StakingPortfolio
            address={selectedAccount?.address}
            buttons={[{
              Icon: BuyCrypto,
              onClick: noop,
              text: t('Unstake')
            },
            {
              Icon: Timer1,
              onClick: noop,
              text: t('Fast Unstake')
            }]}
            genesisHash={genesisHash as unknown as string}
            staked={staked as unknown as BN}
            style={{ mt: '20px' }}
            type='solo'
          />
          <Container disableGutters sx={{ display: 'flex', flexDirection: layoutDirection, gap: '4px', mt: '20px', px: '15px', width: '100%' }}>
            <StakingInfoTile
              Icon={Award}
              buttonsArray={[
                {
                  Icon: Timer,
                  onClick: noop,
                  text: t('Pending Rewards')
                },
                {
                  Icon: Graph,
                  onClick: noop,
                  text: t('Chart')
                }
              ]}
              cryptoAmount={rewards}
              decimal={decimal ?? 0}
              fiatAmount={0}
              layoutDirection={layoutDirection}
              title={t('Rewards paid')}
              token={token ?? ''}
            />
            <StakingInfoTile
              Icon={Moneys}
              buttonsArray={[{
                Icon: Strongbox2,
                onClick: noop,
                text: t('Withdraw')
              }]}
              cryptoAmount={redeemable}
              decimal={decimal ?? 0}
              fiatAmount={0}
              layoutDirection={layoutDirection}
              title={t('Redeemable')}
              token={token ?? ''}
            />
            <StakingInfoTile
              Icon={LockSlash}
              buttonsArray={[{
                Icon: Trade,
                onClick: noop,
                text: t('Restake')
              }]}
              cryptoAmount={unlockingAmount}
              decimal={decimal ?? 0}
              fiatAmount={0}
              layoutDirection={layoutDirection}
              onExpand={toBeReleased?.length ? onExpand : undefined}
              title={t('Unstaking')}
              token={token ?? ''}
            />
          </Container>
          <AvailableToStake
            availableAmount={stakingInfo.availableBalanceToStake}
            decimal={decimal}
            stakeType='solo'
            style={{ m: '8px auto 0', width: 'calc(100% - 30px)' }}
            token={token}
          />
        </Motion>
      </Grid>
      <ToBeReleased
        decimal={decimal ?? 0}
        handleClose={handleCloseMenu}
        onRestake={noop}
        openMenu={unstakingMenu}
        toBeReleased={toBeReleased ?? []}
        token={token ?? ''}
      />
    </>
  );
}
