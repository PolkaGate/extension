// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { AccountBalance as TreasuryIcon, AdminPanelSettings as AdminsIcon, BorderAll as All, Cancel, Hub as Root } from '@mui/icons-material/';
import { Grid, Typography } from '@mui/material';
import React, { useCallback } from 'react';

type DecidingCount = [string, number];

interface Props {
  decidingCounts: DecidingCount[] | undefined;
  setSelectedSubMenu: React.Dispatch<React.SetStateAction<string>>;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>

}

export default function ReferendaMenu({ decidingCounts, setMenuOpen, setSelectedSubMenu }: Props): React.ReactElement<Props> {
  const findItemDecidingCount = useCallback((item: string): number | undefined => {
    if (!decidingCounts) {
      return undefined;
    }

    const itemKey = item.toLowerCase().replaceAll(' ', '_');
    const filtered = decidingCounts.find(([key]) => key === itemKey);

    return filtered?.[1];
  }, [decidingCounts]);

  function MenuItem({ borderWidth = '2px', clickable = true, fontWeight, icon, item, width = '18%' }: { item: string, icon?: React.ReactElement, width?: string, borderWidth?: string, fontWeight?: number, clickable?: boolean }): React.ReactElement {
    const decidingCount = findItemDecidingCount(item);
    const onSubMenuClick = useCallback(() => {
      setSelectedSubMenu(item);
      setMenuOpen((prevStatus) => !prevStatus);
    }, [item]);

    return (
      <Grid alignItems='center' container item sx={{ borderBottom: `${borderWidth} solid`, color: clickable && 'primary.main', cursor: clickable && 'pointer', fontSize: '18px', width, borderColor: 'primary.main', mr: '37px', py: '5px', '&:hover': clickable && { fontWeight: 700 } }}>
        {icon}
        <Typography onClick={onSubMenuClick} sx={{ display: 'inline-block', fontWeight: fontWeight || 'inherit' }}>
          {item}{decidingCount ? ` (${decidingCount})` : ''}
        </Typography>

      </Grid>
    );
  }

  return (
    <Grid alignItems='flex-start' container item sx={{ bgcolor: 'background.paper', px: '2%', py: '15px', zIndex: 10, position: 'absolute' }}>
      <MenuItem
        fontWeight={500}
        icon={<All sx={{ fontSize: 20, fontWeight: 500, mr: '10px' }} />}
        item='All'
      />
      <MenuItem
        fontWeight={500}
        icon={<Root sx={{ fontSize: 20, mr: '10px' }} />}
        item='Root'
      />
      <Grid container item sx={{ width: '18%' }}>
        <MenuItem
          clickable={false}
          fontWeight={500}
          icon={<Cancel sx={{ fontSize: 20, mr: '10px' }} />}
          item='Referendum'
          width='100%'
        />
        <MenuItem
          borderWidth='1px'
          item='Referendum Canceller'
          width='100%'
        />
        <MenuItem
          borderWidth='2px'
          item='Referendum Killer'
          width='100%'
        />
      </Grid>
      <Grid container item sx={{ width: '18%' }}>
        <MenuItem
          clickable={false}
          fontWeight={500}
          icon={<AdminsIcon sx={{ fontSize: 20, mr: '10px' }} />}
          item='Admin'
          width='100%'
        />
        <MenuItem
          borderWidth='1px'
          item='Auction Admin'
          width='100%'
        />
        <MenuItem
          borderWidth='1px'
          item='General Admin'
          width='100%'
        />
        <MenuItem
          borderWidth='1px'
          item='Lease Admin'
          width='100%'
        />
        <MenuItem
          borderWidth='2px'
          item='Staking Admin'
          width='100%'
        />
      </Grid>
      <Grid container item sx={{ width: '18%' }}>
        <MenuItem
          clickable={false}
          fontWeight={500}
          icon={<TreasuryIcon sx={{ fontSize: 20, mr: '10px' }} />}
          item='Treasury'
          width='100%'
        />
        <MenuItem
          borderWidth='1px'
          item='Treasurer'
          width='100%'
        />
        <MenuItem
          borderWidth='1px'
          item='small Tipper'
          width='100%'
        />
        <MenuItem
          borderWidth='1px'
          item='Big Tipper'
          width='100%'
        />
        <MenuItem
          borderWidth='1px'
          item='Small Spender'
          width='100%'
        />
        <MenuItem
          borderWidth='1px'
          item='Medium Spender'
          width='100%'
        />
        <MenuItem
          borderWidth='2px'
          item='Big Spender'
          width='100%'
        />
      </Grid>
    </Grid>
  );
}

