// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { AccountBalance as TreasuryIcon, AdminPanelSettings as AdminsIcon, BorderAll as All, Cancel, Hub as Root } from '@mui/icons-material/';
import { Container, Grid, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { MAX_WIDTH } from '.';

type DecidingCount = [string, number];

interface Props {
  decidingCounts: DecidingCount[] | undefined;
  setSelectedSubMenu: React.Dispatch<React.SetStateAction<string>>;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>

}

export const findItemDecidingCount = (item: string, decidingCounts: DecidingCount[] | undefined): number | undefined => {
  if (!decidingCounts) {
    return undefined;
  }

  const itemKey = item.toLowerCase().replaceAll(' ', '_');
  const filtered = decidingCounts.find(([key]) => key === itemKey);

  return filtered?.[1];
};

export default function ReferendaMenu({ decidingCounts, setMenuOpen, setSelectedSubMenu }: Props): React.ReactElement<Props> {
  function MenuItem({ borderWidth = '2px', clickable = true, fontWeight, icon, item, top = false, width = '18%' }: { item: string, icon?: React.ReactElement, top?: boolean, width?: string, borderWidth?: string, fontWeight?: number, clickable?: boolean }): React.ReactElement {
    const decidingCount = findItemDecidingCount(item, decidingCounts);
    const onSubMenuClick = useCallback(() => {
      setSelectedSubMenu(item);
      setMenuOpen((prevStatus) => !prevStatus);
    }, [item]);

    return (
      <Grid alignItems='center' container item sx={{ borderBottom: top && `${borderWidth} solid`, color: clickable && 'primary.main', cursor: clickable && 'pointer', fontSize: '18px', width, borderColor: 'primary.main', mr: '20px', py: '5px', '&:hover': clickable && { fontWeight: 700, textDecoration: 'underline' } }}>
        {icon}
        <Typography onClick={onSubMenuClick} sx={{ display: 'inline-block', fontWeight: fontWeight || 'inherit' }}>
          {item}{decidingCount ? ` (${decidingCount})` : ''}
        </Typography>

      </Grid>
    );
  }

  return (
    <Grid alignItems='flex-start' container item sx={{ bgcolor: 'background.paper', py: '15px', zIndex: 10, position: 'absolute', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)' }}>
      <Container disableGutters sx={{ maxWidth: MAX_WIDTH }}>
        <Grid alignItems='flex-start' container item >
          <MenuItem
            fontWeight={500}
            icon={<All sx={{ fontSize: 20, fontWeight: 500, mr: '10px' }} />}
            item='All'
            top
            width='7%'
          />
          <MenuItem
            fontWeight={500}
            icon={<Root sx={{ fontSize: 20, mr: '10px' }} />}
            item='Root'
            top
            width='8%'
          />
          <Grid container item sx={{ width: '17%' }}>
            <MenuItem
              clickable={false}
              fontWeight={500}
              icon={<Cancel sx={{ fontSize: 20, mr: '10px' }} />}
              item='Referendum'
              top
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
          <Grid container item sx={{ width: '25.5%' }}>
            <MenuItem
              clickable={false}
              fontWeight={500}
              icon={<AdminsIcon sx={{ fontSize: 20, mr: '10px' }} />}
              item='Admin'
              top
              width='100%'
            />
            <Grid container item xs={6}>
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
            </Grid>
            <Grid container item xs={6}>
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
          </Grid>
          <Grid container item sx={{ width: '39%' }}>
            <MenuItem
              clickable={false}
              fontWeight={500}
              icon={<TreasuryIcon sx={{ fontSize: 20 }} />}
              item='Treasury'
              top
              width='100%'
            />
            <Grid container item xs={3.5}>
              <MenuItem
                borderWidth='1px'
                item='Small Tipper'
                width='100%'
              />
              <MenuItem
                borderWidth='1px'
                item='Big Tipper'
                width='100%'
              />
            </Grid>
            <Grid container item xs={4.5}>
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
            </Grid>
            <Grid container item xs={4}>
              <MenuItem
                borderWidth='1px'
                item='Big Spender'
                width='100%'
              />
              <MenuItem
                borderWidth='2px'
                item='Treasurer'
                width='100%'
              />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Grid>
  );
}
