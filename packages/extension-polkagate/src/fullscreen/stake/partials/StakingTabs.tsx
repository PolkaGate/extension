// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Container, Stack, Typography } from '@mui/material';
import React, { type ReactElement } from 'react';

import VelvetBox from '../../../style/VelvetBox';

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

interface StakingTabBodyProps {
  content: ReactElement;
  style?: React.CSSProperties;
}

const StakingTabBody = ({ content, style }: StakingTabBodyProps) => {
  return (
    <VelvetBox style={style}>
      {content}
    </VelvetBox>
  );
};

interface Props extends StakingTabsHeaderProps, StakingTabBodyProps {}

function StakingTabs ({ content, items, style }: Props) {
  return (
    <Stack direction='column' sx={{ gap: '12px', px: '18px' }}>
      <StakingTabsHeader items={items} />
      <StakingTabBody content={content} style={style} />
    </Stack>
  );
}

export default React.memo(StakingTabs);
