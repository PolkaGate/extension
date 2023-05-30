// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { AdminPanelSettings as AdminsIcon, BorderAll as All, Groups3 as Groups3Icon, List as ListIcon } from '@mui/icons-material/';
import { Container, Grid, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { Count } from '../../../hooks/useDecidingCount';
import { MAX_WIDTH } from '../utils/consts';
import { findItemDecidingCount } from './ReferendaMenu';

interface Props {
  address: string | undefined;
  decidingCounts: Count[] | undefined;
  setSelectedSubMenu: React.Dispatch<React.SetStateAction<string | undefined>>;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>

}

export default function FellowshipMenu({ address, decidingCounts, setMenuOpen, setSelectedSubMenu }: Props): React.ReactElement<Props> {
  const history = useHistory();

  function MenuItem({ borderWidth = '2px', clickable = true, fontWeight, icon, item, top = false, width = '18%' }: { item: string, icon?: React.ReactElement, top?: boolean, width?: string, borderWidth?: string, fontWeight?: number, clickable?: boolean }): React.ReactElement {
    const decidingCount = findItemDecidingCount(item, decidingCounts);

    const onSubMenuClick = useCallback(() => {
      address && history.push({
        pathname: `/governance/${address}/fellowship`
      });

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
            icon={<ListIcon sx={{ fontSize: 20, mr: '10px' }} />}
            item='Members'
            top
            width='9%'
          />
          <Grid container item sx={{ width: '15%' }}>
            <MenuItem
              clickable={false}
              fontWeight={500}
              icon={<AdminsIcon sx={{ fontSize: 20, mr: '10px' }} />}
              item='Admin'
              top
              width='100%'
            />
            <MenuItem
              borderWidth='1px'
              item='Whitelisted Caller'
              width='100%'
            />
            <MenuItem
              borderWidth='2px'
              item='Fellowship Admin'
              width='100%'
            />
          </Grid>
          <Grid container item sx={{ width: '64.5%' }}>
            <MenuItem
              clickable={false}
              fontWeight={500}
              icon={<Groups3Icon sx={{ fontSize: 20, mr: '10px' }} />}
              item='Member Referenda'
              top
              width='100%'
            />
            <Grid container item xs={2.4}>
              <MenuItem
                borderWidth='1px'
                item='Candidates'
                width='100%'
              />
              <MenuItem
                borderWidth='1px'
                item='Members'
                width='100%'
              />
            </Grid>
            <Grid container item xs={2.4}>
              <MenuItem
                borderWidth='1px'
                item='Proficients'
                width='100%'
              />
              <MenuItem
                borderWidth='2px'
                item='Fellows'
                width='100%'
              />
            </Grid>
            <Grid container item xs={2.4}>
              <MenuItem
                borderWidth='1px'
                item='Senior Fellows'
                width='100%'
              />
              <MenuItem
                borderWidth='2px'
                item='Experts'
                width='100%'
              />
            </Grid>
            <Grid container item xs={2.4}>
              <MenuItem
                borderWidth='1px'
                item='Senior Experts'
                width='100%'
              />
              <MenuItem
                borderWidth='2px'
                item='Masters'
                width='100%'
              />
            </Grid>
            <Grid container item xs={2.4}>
              <MenuItem
                borderWidth='1px'
                item='Senior Masters'
                width='100%'
              />
              <MenuItem
                borderWidth='2px'
                item='Grand Masters'
                width='100%'
              />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Grid>
  );
}
