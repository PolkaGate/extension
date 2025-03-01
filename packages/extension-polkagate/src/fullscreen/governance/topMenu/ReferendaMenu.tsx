// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-max-props-per-line */

import type { Count } from '../../../hooks/useDecidingCount';

import { AccountBalance as TreasuryIcon, AdminPanelSettings as AdminsIcon, BorderAll as All, Cancel, Hub as Root } from '@mui/icons-material/';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { MAX_WIDTH } from '../utils/consts';

interface Props {
  address: string | undefined;
  decidingCounts: Count[] | undefined;
  setSelectedSubMenu: React.Dispatch<React.SetStateAction<string>>;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const findItemDecidingCount = (item: string, decidingCounts: Count[] | undefined): number | undefined => {
  if (!decidingCounts) {
    return undefined;
  }

  const itemKey = item.toLowerCase().replaceAll(' ', '_');
  const filtered = decidingCounts.find(([key]) => key === itemKey);

  return filtered?.[1];
};

interface MenuItemProps {
  address: string | undefined;
  decidingCounts: Count[] | undefined;
  item: string;
  icon?: React.ReactElement;
  top?: boolean;
  width?: string;
  borderWidth?: string;
  fontWeight?: number;
  clickable?: boolean;
  setSelectedSubMenu: React.Dispatch<React.SetStateAction<string>>;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ToolbarMenuItem = React.memo(function ToolbarMenuItem({ address, borderWidth = '2px', clickable = true, decidingCounts, fontWeight, icon, item, setMenuOpen, setSelectedSubMenu, top = false, width = '18%' }: MenuItemProps): React.ReactElement {
  const theme = useTheme();
  const history = useHistory();

  const decidingCount = findItemDecidingCount(item, decidingCounts);
  const onSubMenuClick = useCallback(() => {
    address && history.push({
      pathname: `/governance/${address}/referenda`
    });

    setSelectedSubMenu(item);
    setMenuOpen((prevStatus) => !prevStatus);
  }, [address, history, item, setMenuOpen, setSelectedSubMenu]);

  return (
    <Grid alignItems='center' container item
      sx={{
        '&:hover': clickable ? { fontWeight: 700, textDecoration: 'underline' } : undefined,
        borderBottom: top ? `${borderWidth} solid` : undefined,
        borderColor: 'primary.main',
        color: clickable
          ? (theme.palette.mode === 'light'
            ? 'secondary.main'
            : 'text.primary')
          : (theme.palette.mode === 'light'
            ? 'text.primary'
            : 'action.focus'
          ),
        cursor: clickable ? 'pointer' : 'default',
        fontSize: '18px',
        mr: '20px',
        py: '5px',
        width
      }}
    >
      {icon}
      <Typography onClick={onSubMenuClick} sx={{ display: 'inline-block', fontWeight: fontWeight || 'inherit' }}>
        {item}
      </Typography>
      <Typography sx={{ color: 'action.focus', display: 'inline-block', fontWeight: fontWeight || 'inherit', pl: '2px' }}>
        {decidingCount ? ` (${decidingCount})` : ''}
      </Typography>
    </Grid>
  );
});

export default function ReferendaMenu({ address, decidingCounts, setMenuOpen, setSelectedSubMenu }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const onMouseLeave = useCallback(() => {
    setMenuOpen(false);
  }, [setMenuOpen]);

  return (
    <Grid alignItems='flex-start' container item justifyContent='center' onMouseLeave={onMouseLeave} sx={{ bgcolor: 'background.paper', borderBottom: 2, borderColor: theme.palette.mode === 'dark' ? 'primary.main' : 'background.paper', borderTop: 2, boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', position: 'absolute', py: '15px', zIndex: 10 }}>
      <Grid alignItems='flex-start' container item justifyContent='center' sx={{ maxWidth: `calc(${MAX_WIDTH} + 50px)` }}>
        <ToolbarMenuItem
          address={address}
          decidingCounts={decidingCounts}
          fontWeight={500}
          icon={<All sx={{ fontSize: 20, fontWeight: 500, mr: '10px' }} />}
          item='All'
          setMenuOpen={setMenuOpen}
          setSelectedSubMenu={setSelectedSubMenu}
          top
          width='7%'
        />
        <Grid container item sx={{ width: '13%' }}>
          <ToolbarMenuItem
            address={address}
            decidingCounts={decidingCounts}
            fontWeight={500}
            icon={<Root sx={{ fontSize: 20, mr: '10px' }} />}
            item='Root'
            setMenuOpen={setMenuOpen}
            setSelectedSubMenu={setSelectedSubMenu}
            top
            width='100%'
          />
          <ToolbarMenuItem
            address={address}
            borderWidth='1px'
            decidingCounts={decidingCounts}
            item='Wish For Change'
            setMenuOpen={setMenuOpen}
            setSelectedSubMenu={setSelectedSubMenu}
            width='100%'
          />
        </Grid>
        <Grid container item sx={{ width: '16%' }}>
          <ToolbarMenuItem
            address={address}
            clickable={false}
            decidingCounts={decidingCounts}
            fontWeight={500}
            icon={<Cancel sx={{ fontSize: 20, mr: '10px' }} />}
            item='Referendum'
            setMenuOpen={setMenuOpen}
            setSelectedSubMenu={setSelectedSubMenu}
            top
            width='100%'
          />
          <ToolbarMenuItem
            address={address}
            borderWidth='1px'
            decidingCounts={decidingCounts}
            item='Referendum Canceller'
            setMenuOpen={setMenuOpen}
            setSelectedSubMenu={setSelectedSubMenu}
            width='100%'
          />
          <ToolbarMenuItem
            address={address}
            borderWidth='2px'
            decidingCounts={decidingCounts}
            item='Referendum Killer'
            setMenuOpen={setMenuOpen}
            setSelectedSubMenu={setSelectedSubMenu}
            width='100%'
          />
        </Grid>
        <Grid container item sx={{ width: '23%' }}>
          <ToolbarMenuItem
            address={address}
            clickable={false}
            decidingCounts={decidingCounts}
            fontWeight={500}
            icon={<AdminsIcon sx={{ fontSize: 20, mr: '10px' }} />}
            item='Admin'
            setMenuOpen={setMenuOpen}
            setSelectedSubMenu={setSelectedSubMenu}
            top
            width='100%'
          />
          <Grid container item xs={6}>
            <ToolbarMenuItem
              address={address}
              borderWidth='1px'
              decidingCounts={decidingCounts}
              item='Auction Admin'
              setMenuOpen={setMenuOpen}
              setSelectedSubMenu={setSelectedSubMenu}
              width='100%'
            />
            <ToolbarMenuItem
              address={address}
              borderWidth='1px'
              decidingCounts={decidingCounts}
              item='General Admin'
              setMenuOpen={setMenuOpen}
              setSelectedSubMenu={setSelectedSubMenu}
              width='100%'
            />
          </Grid>
          <Grid container item xs={6}>
            <ToolbarMenuItem
              address={address}
              borderWidth='1px'
              decidingCounts={decidingCounts}
              item='Lease Admin'
              setMenuOpen={setMenuOpen}
              setSelectedSubMenu={setSelectedSubMenu}
              width='100%'
            />
            <ToolbarMenuItem
              address={address}
              borderWidth='2px'
              decidingCounts={decidingCounts}
              item='Staking Admin'
              setMenuOpen={setMenuOpen}
              setSelectedSubMenu={setSelectedSubMenu}
              width='100%'
            />
          </Grid>
        </Grid>
        <Grid container item sx={{ width: '38%' }}>
          <ToolbarMenuItem
            address={address}
            clickable={false}
            decidingCounts={decidingCounts}
            fontWeight={500}
            icon={<TreasuryIcon sx={{ fontSize: 20 }} />}
            item='Treasury'
            setMenuOpen={setMenuOpen}
            setSelectedSubMenu={setSelectedSubMenu}
            top
            width='100%'
          />
          <Grid container item xs={3.5}>
            <ToolbarMenuItem
              address={address}
              borderWidth='1px'
              decidingCounts={decidingCounts}
              item='Small Tipper'
              setMenuOpen={setMenuOpen}
              setSelectedSubMenu={setSelectedSubMenu}
              width='100%'
            />
            <ToolbarMenuItem
              address={address}
              borderWidth='1px'
              decidingCounts={decidingCounts}
              item='Big Tipper'
              setMenuOpen={setMenuOpen}
              setSelectedSubMenu={setSelectedSubMenu}
              width='100%'
            />
          </Grid>
          <Grid container item xs={4.5}>
            <ToolbarMenuItem
              address={address}
              borderWidth='1px'
              decidingCounts={decidingCounts}
              item='Small Spender'
              setMenuOpen={setMenuOpen}
              setSelectedSubMenu={setSelectedSubMenu}
              width='100%'
            />
            <ToolbarMenuItem
              address={address}
              borderWidth='1px'
              decidingCounts={decidingCounts}
              item='Medium Spender'
              setMenuOpen={setMenuOpen}
              setSelectedSubMenu={setSelectedSubMenu}
              width='100%'
            />
          </Grid>
          <Grid container item xs={4}>
            <ToolbarMenuItem
              address={address}
              borderWidth='1px'
              decidingCounts={decidingCounts}
              item='Big Spender'
              setMenuOpen={setMenuOpen}
              setSelectedSubMenu={setSelectedSubMenu}
              width='100%'
            />
            <ToolbarMenuItem
              address={address}
              borderWidth='2px'
              decidingCounts={decidingCounts}
              item='Treasurer'
              setMenuOpen={setMenuOpen}
              setSelectedSubMenu={setSelectedSubMenu}
              width='100%'
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
