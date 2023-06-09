// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Groups as FellowshipIcon, HowToVote as ReferendaIcon } from '@mui/icons-material/';
import { Button, ClickAwayListener, Container, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';

import { useApi, useTranslation } from '../../hooks';
import { DecidingCount } from '../../hooks/useDecidingCount';
import FellowshipMenu from './topMenu/FellowshipMenu';
import ReferendaMenu from './topMenu/ReferendaMenu';
import { MAX_WIDTH } from './utils/consts';
import { TopMenu } from './utils/types';
import { Delegate } from './delegate';
import { SubmitReferendum } from './submitReferendum';

interface Props {
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  menuOpen: boolean;
  setSelectedSubMenu: React.Dispatch<React.SetStateAction<string>>;
  decidingCounts: DecidingCount | undefined;
}

export default function Toolbar({ decidingCounts, menuOpen, setMenuOpen, setSelectedSubMenu }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { address, postId, topMenu } = useParams<{ address: string, topMenu: 'referenda' | 'fellowship', postId?: string }>();
  const api = useApi(address);

  const [openSubmitReferendum, setOpenSubmitReferendum] = useState(false);
  const [openDelegate, setOpenDelegate] = useState(false);
  const [showDelegationNote, setShowDelegationNote] = useState<boolean>(true);
  const [hoveredTopMenu, setHoveredTopMenu] = useState<'referenda' | 'fellowship'>(topMenu);

  React.useEffect(() => {
    setShowDelegationNote(window.localStorage.getItem('delegate_about_disabled') !== 'true');
  }, [openDelegate, openSubmitReferendum]);

  const handleOpenSubmitReferendum = () => {
    setOpenSubmitReferendum(true);
  };

  const handleOpenDelegate = () => {
    setOpenDelegate(true);
  };

  const onTopMenuMenuMouseEnter = useCallback((item: TopMenu) => {
    setHoveredTopMenu(item.toLowerCase());
    setMenuOpen(true);
  }, [setMenuOpen]);

  const handleClickAway = useCallback(() => {
    setMenuOpen(false);
  }, [setMenuOpen]);

  const menuBgColor = theme.palette.mode === 'light' ? 'primary.main' : 'background.paper';
  const menuTextColor = theme.palette.mode === 'light' ? 'primary.main' : 'text.primary';
  const selectedMenuBgColor = theme.palette.mode === 'light' ? 'background.paper' : 'primary.main';

  function TopMenuComponent({ item }: { item: TopMenu }): React.ReactElement<{ item: TopMenu }> {
    return (
      <Grid alignItems='center' container item justifyContent='center' onMouseEnter={() => onTopMenuMenuMouseEnter(item)} sx={{
        mt: '3.5px', px: '5px',
        bgcolor: hoveredTopMenu === item.toLowerCase() ? selectedMenuBgColor : menuBgColor,
        color: hoveredTopMenu === item.toLowerCase() ? menuTextColor : 'white',
        width: '150px', height: '46px', cursor: 'pointer'
      }}>
        <Typography sx={{ display: 'inline-block', fontWeight: 500, fontSize: '20px' }}>
          {item}
        </Typography>
        {item === 'Fellowship'
          ? <FellowshipIcon sx={{ fontSize: 29, ml: '10px' }} />
          : <ReferendaIcon sx={{ fontSize: 29, ml: '10px', transform: 'scaleX(-1)' }} />
        }
      </Grid>
    );
  }

  return (
    <>
      <Grid container id='menu' sx={{ bgcolor: theme.palette.mode === 'light' ? 'primary.main' : 'background.paper', borderBottom: 1, borderTop: 1, borderColor: theme.palette.mode === 'dark' && 'primary.main', height: '51.5px', color: 'text.secondary', fontSize: '20px', fontWeight: 500 }}>
        <Container disableGutters sx={{ maxWidth: MAX_WIDTH }}>
          <Grid alignItems='center' container justifyContent='space-between'>
            <ClickAwayListener onClickAway={handleClickAway}>
              <Grid alignItems='flex-end' container item justifyContent='flex-start' md={4}>
                <TopMenuComponent item={'Referenda'} />
                <TopMenuComponent item={'Fellowship'} />
              </Grid>
            </ClickAwayListener>
            <Grid container item justifyContent='flex-end' md={5}>
              <Button
                // disabled={disabled}
                onClick={handleOpenDelegate}
                sx={{
                  backgroundColor: theme.palette.mode === 'light' ? 'background.paper' : 'primary.main',
                  borderRadius: '5px',
                  color: theme.palette.mode === 'light' ? 'primary.main' : 'text.primary',
                  fontSize: '18px',
                  fontWeight: 500,
                  height: '36px',
                  textTransform: 'none',
                  width: '190px',
                  '&:hover': {
                    backgroundColor: '#fff',
                    color: '#3c52b2'
                  }
                }}
                variant='contained'
              >
                {t('Delegate Vote')}
              </Button>
              <Button
                disabled={!api}
                onClick={handleOpenSubmitReferendum}
                sx={{
                  backgroundColor: theme.palette.mode === 'light' ? 'background.paper' : 'primary.main',
                  borderRadius: '5px',
                  color: theme.palette.mode === 'light' ? 'primary.main' : 'text.primary',
                  fontSize: '18px',
                  fontWeight: 500,
                  height: '36px',
                  textTransform: 'none',
                  ml: '15px',
                  width: '190px',
                  '&:hover': {
                    backgroundColor: '#fff',
                    color: '#3c52b2'
                  }
                }}
                variant='contained'
              >
                {t('Submit Referendum')}
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Grid>
      {menuOpen && hoveredTopMenu === 'referenda' &&
        <ReferendaMenu address={address} decidingCounts={decidingCounts?.referenda} setMenuOpen={setMenuOpen} setSelectedSubMenu={setSelectedSubMenu} />
      }
      {menuOpen && hoveredTopMenu === 'fellowship' &&
        <FellowshipMenu address={address} decidingCounts={decidingCounts?.fellowship} setMenuOpen={setMenuOpen} setSelectedSubMenu={setSelectedSubMenu} />
      }
      {openSubmitReferendum &&
        <SubmitReferendum
          address={address}
          api={api}
          open={openSubmitReferendum}
          setOpen={setOpenSubmitReferendum}
        />
      }
      {openDelegate &&
        <Delegate
          address={address}
          api={api}
          open={openDelegate}
          setOpen={setOpenDelegate}
          showDelegationNote={showDelegationNote}
        />
      }
    </>
  );
}
