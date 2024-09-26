// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { DecidingCount } from '../../hooks/useDecidingCount';
import type { TopMenu } from './utils/types';

import { Groups as FellowshipIcon, HowToVote as ReferendaIcon } from '@mui/icons-material/';
import { Button, ClickAwayListener, Container, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';
import { useParams } from 'react-router';

import { useApi, useTranslation } from '../../hooks';
import FellowshipMenu from './topMenu/FellowshipMenu';
import ReferendaMenu from './topMenu/ReferendaMenu';
import { MAX_WIDTH } from './utils/consts';
import { Delegate } from './delegate';

interface Props {
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  menuOpen: boolean;
  setSelectedSubMenu: React.Dispatch<React.SetStateAction<string | undefined>>;
  decidingCounts: DecidingCount | undefined;
}

const MENU_DELAY = 150; // ms

export default function Toolbar ({ decidingCounts, menuOpen, setMenuOpen, setSelectedSubMenu }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { address, topMenu } = useParams<{ address: string, topMenu: 'referenda' | 'fellowship', postId?: string }>();
  const api = useApi(address);
  const ref = useRef<{ timeoutId: number | null }>({ timeoutId: null });

  const [openDelegate, setOpenDelegate] = useState(false);
  const [showDelegationNote, setShowDelegationNote] = useState<boolean>(true);
  const [hoveredTopMenu, setHoveredTopMenu] = useState<'referenda' | 'fellowship'>(topMenu);

  React.useEffect(() => {
    setShowDelegationNote(window.localStorage.getItem('delegate_about_disabled') !== 'true');
  }, [openDelegate]);

  const handleOpenDelegate = useCallback(() => {
    setOpenDelegate(true);
  }, []);

  const onTopMenuMenuMouseEnter = useCallback((item: TopMenu) => {
    ref.current.timeoutId && clearTimeout(ref.current.timeoutId);

    ref.current.timeoutId = setTimeout(() => {
      setHoveredTopMenu(item.toLowerCase() as 'referenda' | 'fellowship');
      setMenuOpen(true);
    }, MENU_DELAY) as unknown as number;
  }, [setMenuOpen]);

  const onTopMenuMenuMouseLeave = useCallback(() => {
    !menuOpen && ref.current.timeoutId && clearTimeout(ref.current.timeoutId);
  }, [menuOpen]);

  const handleClickAway = useCallback(() => {
    setMenuOpen(false);
  }, [setMenuOpen]);

  const menuBgColor = theme.palette.mode === 'light' ? 'primary.main' : 'background.paper';
  const menuTextColor = theme.palette.mode === 'light' ? 'primary.main' : 'text.primary';
  const selectedMenuBgColor = theme.palette.mode === 'light' ? 'background.paper' : 'primary.main';

  function TopMenuComponent ({ item }: { item: TopMenu }): React.ReactElement<{ item: TopMenu }> {
    return (
      <Grid
        alignItems='center'
        container
        item
        justifyContent='center'
        // eslint-disable-next-line react/jsx-no-bind
        onMouseEnter={() => onTopMenuMenuMouseEnter(item)}
        // eslint-disable-next-line react/jsx-no-bind
        onMouseLeave={() => onTopMenuMenuMouseLeave()}
        sx={{
          bgcolor: hoveredTopMenu === item.toLowerCase() ? selectedMenuBgColor : menuBgColor,
          color: hoveredTopMenu === item.toLowerCase() ? menuTextColor : 'white',
          cursor: 'pointer',
          height: '46px',
          mt: '3.5px',
          px: '5px',
          width: '150px'
        }}>
        <Typography sx={{ display: 'inline-block', fontSize: '20px', fontWeight: 500 }}>
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
      <Grid container id='menu' sx={{ bgcolor: theme.palette.mode === 'light' ? 'primary.main' : 'background.paper', borderBottom: 1, borderTop: 1, borderColor: theme.palette.mode === 'dark' ? 'primary.main' : undefined, height: '51.5px', color: 'text.secondary', fontSize: '20px', fontWeight: 500, minWidth: '810px' }}>
        <Container disableGutters sx={{ maxWidth: MAX_WIDTH }}>
          <Grid alignItems='center' container justifyContent='space-between'>
            <ClickAwayListener onClickAway={handleClickAway}>
              <Grid alignItems='flex-end' container item justifyContent='flex-start' xs={6}>
                <TopMenuComponent item={'Referenda'} />
                <TopMenuComponent item={'Fellowship'} />
              </Grid>
            </ClickAwayListener>
            <Grid container item justifyContent='flex-end' xs={6}>
              <Button
                onClick={handleOpenDelegate}
                sx={{
                  '&:hover': {
                    backgroundColor: '#fff',
                    color: '#3c52b2'
                  },
                  backgroundColor: theme.palette.mode === 'light' ? 'background.paper' : 'primary.main',
                  borderRadius: '5px',
                  color: theme.palette.mode === 'light' ? 'primary.main' : 'text.primary',
                  fontSize: '18px',
                  fontWeight: 500,
                  height: '36px',
                  minWidth: '190px',
                  textTransform: 'none'
                }}
                variant='contained'
              >
                {t('Delegate Vote')}
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
