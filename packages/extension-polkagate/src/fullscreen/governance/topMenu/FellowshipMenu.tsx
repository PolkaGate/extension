// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-max-props-per-line */

import type { Count } from '../../../hooks/useDecidingCount';

import { AdminPanelSettings as AdminsIcon, BorderAll as All, Groups3 as Groups3Icon, List as ListIcon } from '@mui/icons-material/';
import { Container, Grid, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { MAX_WIDTH } from '../utils/consts';
import { ToolbarMenuItem } from './ReferendaMenu';

interface Props {
  address: string | undefined;
  decidingCounts: Count[] | undefined;
  setSelectedSubMenu: React.Dispatch<React.SetStateAction<string>>;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>

}

export default function FellowshipMenu({ address, decidingCounts, setMenuOpen, setSelectedSubMenu }: Props): React.ReactElement<Props> {
  const theme = useTheme();

  const onMouseLeave = useCallback(() => {
    setMenuOpen(false);
  }, [setMenuOpen]);

  return (
    <Grid alignItems='flex-start' container item onMouseLeave={onMouseLeave} sx={{ bgcolor: 'background.paper', borderBottom: 2, borderColor: theme.palette.mode === 'dark' ? 'primary.main' : 'background.paper', borderTop: 2, boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', position: 'absolute', py: '15px', zIndex: 10 }}>
      <Container disableGutters sx={{ maxWidth: MAX_WIDTH }}>
        <Grid alignItems='flex-start' container item>
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
          <ToolbarMenuItem
            address={address}
            decidingCounts={decidingCounts}
            fontWeight={500}
            icon={<ListIcon sx={{ fontSize: 20, mr: '10px' }} />}
            item='Fellowships'
            setMenuOpen={setMenuOpen}
            setSelectedSubMenu={setSelectedSubMenu}
            top
            width='10%'
          />
          <Grid container item sx={{ width: '14%' }}>
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
            <ToolbarMenuItem
              address={address}
              borderWidth='1px'
              decidingCounts={decidingCounts}
              item='Whitelisted Caller'
              setMenuOpen={setMenuOpen}
              setSelectedSubMenu={setSelectedSubMenu}
              width='100%'
            />
            <ToolbarMenuItem
              address={address}
              borderWidth='2px'
              decidingCounts={decidingCounts}
              item='Fellowship Admin'
              setMenuOpen={setMenuOpen}
              setSelectedSubMenu={setSelectedSubMenu}
              width='100%'
            />
          </Grid>
          <Grid container item sx={{ width: '64.5%' }}>
            <ToolbarMenuItem
              address={address}
              clickable={false}
              decidingCounts={decidingCounts}
              fontWeight={500}
              icon={<Groups3Icon sx={{ fontSize: 20, mr: '10px' }} />}
              item='Member Referenda'
              setMenuOpen={setMenuOpen}
              setSelectedSubMenu={setSelectedSubMenu}
              top
              width='100%'
            />
            <Grid container item xs={2.4}>
              <ToolbarMenuItem
                address={address}
                borderWidth='1px'
                decidingCounts={decidingCounts}
                item='Candidates'
                setMenuOpen={setMenuOpen}
                setSelectedSubMenu={setSelectedSubMenu}
                width='100%'
              />
              <ToolbarMenuItem
                address={address}
                borderWidth='1px'
                decidingCounts={decidingCounts}
                item='Members'
                setMenuOpen={setMenuOpen}
                setSelectedSubMenu={setSelectedSubMenu}
                width='100%'
              />
            </Grid>
            <Grid container item xs={2.4}>
              <ToolbarMenuItem
                address={address}
                borderWidth='1px'
                decidingCounts={decidingCounts}
                item='Proficients'
                setMenuOpen={setMenuOpen}
                setSelectedSubMenu={setSelectedSubMenu}
                width='100%'
              />
              <ToolbarMenuItem
                address={address}
                borderWidth='2px'
                decidingCounts={decidingCounts}
                item='Fellows'
                setMenuOpen={setMenuOpen}
                setSelectedSubMenu={setSelectedSubMenu}
                width='100%'
              />
            </Grid>
            <Grid container item xs={2.4}>
              <ToolbarMenuItem
                address={address}
                borderWidth='1px'
                decidingCounts={decidingCounts}
                item='Senior Fellows'
                setMenuOpen={setMenuOpen}
                setSelectedSubMenu={setSelectedSubMenu}
                width='100%'
              />
              <ToolbarMenuItem
                address={address}
                borderWidth='2px'
                decidingCounts={decidingCounts}
                item='Experts'
                setMenuOpen={setMenuOpen}
                setSelectedSubMenu={setSelectedSubMenu}
                width='100%'
              />
            </Grid>
            <Grid container item xs={2.4}>
              <ToolbarMenuItem
                address={address}
                borderWidth='1px'
                decidingCounts={decidingCounts}
                item='Senior Experts'
                setMenuOpen={setMenuOpen}
                setSelectedSubMenu={setSelectedSubMenu}
                width='100%'
              />
              <ToolbarMenuItem
                address={address}
                borderWidth='2px'
                decidingCounts={decidingCounts}
                item='Masters'
                setMenuOpen={setMenuOpen}
                setSelectedSubMenu={setSelectedSubMenu}
                width='100%'
              />
            </Grid>
            <Grid container item xs={2.4}>
              <ToolbarMenuItem
                address={address}
                borderWidth='1px'
                decidingCounts={decidingCounts}
                item='Senior Masters'
                setMenuOpen={setMenuOpen}
                setSelectedSubMenu={setSelectedSubMenu}
                width='100%'
              />
              <ToolbarMenuItem
                address={address}
                borderWidth='2px'
                decidingCounts={decidingCounts}
                item='Grand Masters'
                setMenuOpen={setMenuOpen}
                setSelectedSubMenu={setSelectedSubMenu}
                width='100%'
              />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Grid>
  );
}
