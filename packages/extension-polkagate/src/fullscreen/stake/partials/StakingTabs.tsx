// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';
import type { SoloStakingInfo } from '../../../hooks/useSoloStakingInfo';
import type { UseStakingRewards } from '../../../hooks/useStakingRewards3';

import { Container, Stack, Typography } from '@mui/material';
import { Discover, MagicStar, Wallet } from 'iconsax-react';
import React, { useCallback, useMemo, useState } from 'react';

import { useTranslation } from '../../../hooks';
import VelvetBox from '../../../style/VelvetBox';
import ValidatorsTabBody from '../new-solo/nominations/ValidatorsTabBody';
import Rewards from '../Rewards';
import StakingPositions from '../stakingPositions';
import { type PopupOpener, StakingPopUps } from '../util/utils';

export interface StakingTabsHeaderItems {
  title: string;
  Icon: Icon;
  isSelected: boolean;
  onClick: () => void;
}

interface StakingTabsHeaderProps {
  items: StakingTabsHeaderItems[];
}

const StakingTabsHeader = ({ items }: StakingTabsHeaderProps) => {
  return (
    <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', gap: '32px' }}>
      {items.map(({ Icon, isSelected, onClick, title }, index) => {
        const iconColor = isSelected ? '#AA83DC' : '#674394';
        const textColor = isSelected ? '#EAEBF1' : '#674394';

        return (
          <Container disableGutters key={index} onClick={onClick} sx={{ alignItems: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'row', gap: '8px', m: 0, p: '4px', width: 'fit-content' }}>
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
  rewardInfo: UseStakingRewards;
  type: 'solo' | 'pool';
  genesisHash: string | undefined;
  token: string | undefined;
  popupOpener: PopupOpener;
  stakingInfo?: SoloStakingInfo;
}

enum STAKING_TABS {
  STAKING_POSITIONS,
  REWARDS,
  MY_POOL,
  VALIDATORS
}

function StakingTabs ({ genesisHash, popupOpener, rewardInfo, stakingInfo, token, type }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<STAKING_TABS>(STAKING_TABS.STAKING_POSITIONS);

  const tabSetter = useCallback((selectedTab: STAKING_TABS) => () => setTab(selectedTab), []);

  const tabItems: StakingTabsHeaderItems[] = useMemo(() => {
    const tabs: StakingTabsHeaderItems[] = [
      {
        Icon: Wallet,
        isSelected: tab === STAKING_TABS.STAKING_POSITIONS,
        onClick: tabSetter(STAKING_TABS.STAKING_POSITIONS),
        title: t('Your staking positions')
      },
      {
        Icon: MagicStar,
        isSelected: tab === STAKING_TABS.REWARDS,
        onClick: tabSetter(STAKING_TABS.REWARDS),
        title: type === 'solo' ? t('Rewards') : t('Claimed Rewards')
      }
    ];

    if (type === 'solo') {
      tabs.push({
        Icon: Discover,
        isSelected: tab === STAKING_TABS.VALIDATORS,
        onClick: tabSetter(STAKING_TABS.VALIDATORS),
        title: t('Validators')
      });
    }

    if (type === 'pool') {
      tabs.push({
        Icon: Discover,
        isSelected: false,
        onClick: popupOpener(StakingPopUps.MY_POOL),
        title: t('My Pool')
      });
    }

    return tabs;
  }, [popupOpener, t, tab, tabSetter, type]);

  const content = useMemo(() => {
    switch (tab) {
      case STAKING_TABS.STAKING_POSITIONS:
        return <StakingPositions popupOpener={popupOpener} />;

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
        return (
          <ValidatorsTabBody
            genesisHash={genesisHash}
            stakingInfo={stakingInfo}
          />);

      case STAKING_TABS.MY_POOL:
        return (<></>);

      default:
        return <></>;
    }
  }, [genesisHash, popupOpener, rewardInfo, stakingInfo, tab, token, type]);

  return (
    <Stack direction='column' sx={{ gap: '12px', px: '18px' }}>
      <StakingTabsHeader items={tabItems} />
      <VelvetBox>
        {content}
      </VelvetBox>
    </Stack>
  );
}

export default React.memo(StakingTabs);
