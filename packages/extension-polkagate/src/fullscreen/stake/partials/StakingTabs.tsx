// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';
import type { SoloStakingInfo } from '../../../hooks/useSoloStakingInfo';
import type { UseStakingRewards } from '../../../hooks/useStakingRewardsChart';
import type { PositionInfo, MyPoolInfo } from '../../../util/types';

import { Container, Stack, Typography, useTheme } from '@mui/material';
import { Discover, MagicStar, Wallet } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { noop } from '@polkadot/util';

import { useFormatted, useTranslation } from '../../../hooks';
import VelvetBox from '../../../style/VelvetBox';
import ValidatorsTabBody from '../new-solo/nominations/ValidatorsTabBody';
import PoolNominations from '../new-pool/nominations/Nominations';
import Rewards from '../Rewards';
import StakingPositions from '../stakingPositions';
import { type PopupOpener } from '../util/utils';

export interface StakingTabsHeaderItems {
  title: string;
  Icon: Icon;
  isSelected: boolean;
  onClick: () => void;
}

interface StakingTabsHeaderProps {
  items: StakingTabsHeaderItems[];
  disabled?: boolean;
}

const StakingTabsHeader = ({ disabled, items }: StakingTabsHeaderProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', gap: '32px' }}>
      {items.map(({ Icon, isSelected, onClick, title }, index) => {
        const iconColor = isSelected ? (isDark ? '#AA83DC' : '#674394') : '#AA83DC';
        const textColor = isSelected ? '#674394' : '#AA83DC';
        const isDisabled = index > 0 && disabled;

        return (
          <Container disableGutters key={index} onClick={isDisabled ? noop : onClick} sx={{ alignItems: 'center', cursor: isDisabled ? 'default' : 'pointer', display: 'flex', flexDirection: 'row', gap: '8px', m: 0, p: '4px', width: 'fit-content' }}>
            <Icon color={iconColor} size='24' variant='Bulk' />
            <Typography color={textColor} textTransform='uppercase' variant='H-2'>
              {title}
            </Typography>
          </Container>
        );
      })}
    </Container>
  );
};

interface Props {
  address?: string | undefined;
  poolInfo?: MyPoolInfo | null | undefined;
  rewardInfo: UseStakingRewards;
  type: 'solo' | 'pool';
  genesisHash: string | undefined;
  token: string | undefined;
  popupOpener: PopupOpener;
  stakingInfo?: SoloStakingInfo;
  setSelectedPosition: React.Dispatch<React.SetStateAction<PositionInfo | undefined>>;
  disabled?: boolean;
}

enum STAKING_TABS {
  STAKING_POSITIONS,
  REWARDS,
  MY_POOL,
  VALIDATORS
}

function StakingTabs({ address, disabled, genesisHash, poolInfo, popupOpener, rewardInfo, setSelectedPosition, stakingInfo, token, type }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<STAKING_TABS>(STAKING_TABS.STAKING_POSITIONS);
  const formatted = useFormatted(address, genesisHash);
  const isPoolNominator = useMemo(() => formatted === poolInfo?.bondedPool?.roles?.nominator?.toString(), [formatted, poolInfo?.bondedPool?.roles?.nominator]);
  const hasValidatorsTab = useMemo(() => type === 'solo' || (type === 'pool' && isPoolNominator), [isPoolNominator, type]);

  const tabSetter = useCallback((selectedTab: STAKING_TABS) => () => setTab(selectedTab), []);

  useEffect(() => {
    if (tab === STAKING_TABS.VALIDATORS && !hasValidatorsTab) {
      setTab(STAKING_TABS.STAKING_POSITIONS);
    }
  }, [hasValidatorsTab, tab]);

  const tabItems: StakingTabsHeaderItems[] = useMemo(() => {
    const tabs: StakingTabsHeaderItems[] = [
      {
        Icon: Wallet,
        isSelected: tab === STAKING_TABS.STAKING_POSITIONS,
        onClick: tabSetter(STAKING_TABS.STAKING_POSITIONS),
        title: t('Earning Positions')
      },
      {
        Icon: MagicStar,
        isSelected: tab === STAKING_TABS.REWARDS,
        onClick: tabSetter(STAKING_TABS.REWARDS),
        title: t('Rewards')
      }
    ];

    if (type === 'solo') {
      tabs.push({
        Icon: Discover,
        isSelected: tab === STAKING_TABS.VALIDATORS,
        onClick: tabSetter(STAKING_TABS.VALIDATORS),
        title: stakingInfo?.isValidator ? t('Validator') : t('Nominations')
      });
    }

    if (type === 'pool' && isPoolNominator) {
      tabs.push({
        Icon: Discover,
        isSelected: tab === STAKING_TABS.VALIDATORS,
        onClick: tabSetter(STAKING_TABS.VALIDATORS),
        title: t('Nominations')
      });
    }

    return tabs;
  }, [isPoolNominator, stakingInfo?.isValidator, t, tab, tabSetter, type]);

  const content = useMemo(() => {
    switch (tab) {
      case STAKING_TABS.STAKING_POSITIONS:
        return (
          <StakingPositions
            popupOpener={popupOpener}
            setSelectedPosition={setSelectedPosition}
          />);

      case STAKING_TABS.REWARDS:
        return (
          <Rewards
            genesisHash={genesisHash}
            popupOpener={popupOpener}
            rewardInfo={rewardInfo}
            token={token}
            type={type}
          />);

      case STAKING_TABS.VALIDATORS:
        if (type === 'solo') {
          return (
            <ValidatorsTabBody
              stakingInfo={stakingInfo}
            />);
        }

        if (type === 'pool' && isPoolNominator) {
          return (
            <PoolNominations
              genesisHash={genesisHash}
              poolInfo={poolInfo}
            />);
        }

        return <></>;

      case STAKING_TABS.MY_POOL:
        return (<></>);

      default:
        return <></>;
    }
  }, [genesisHash, isPoolNominator, poolInfo, popupOpener, rewardInfo, setSelectedPosition, stakingInfo, tab, token, type]);

  return (
    <Stack direction='column' sx={{ gap: '12px', px: '18px' }}>
      <StakingTabsHeader disabled={disabled} items={tabItems} />
      <VelvetBox>
        {content}
      </VelvetBox>
    </Stack>
  );
}

export default React.memo(StakingTabs);
