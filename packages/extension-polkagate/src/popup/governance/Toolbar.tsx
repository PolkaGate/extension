// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Groups as FellowshipIcon, HowToVote as ReferendaIcon } from '@mui/icons-material/';
import { Button, ClickAwayListener, Container, Grid, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { useApi, useTranslation } from '../../hooks';
import { DecidingCount } from '../../hooks/useDecidingCount';
import FellowshipMenu from './topMenu/FellowShipMenu';
import ReferendaMenu from './topMenu/ReferendaMenu';
import { MAX_WIDTH } from './utils/consts';
import { TopMenu } from './utils/types';
import { Delegate } from './delegate';
import { SubmitReferendum } from './submitReferendum';

interface Props {
  address: string | undefined;
  setSelectedTopMenu: React.Dispatch<React.SetStateAction<TopMenu | undefined>>
  selectedTopMenu: TopMenu | undefined;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  menuOpen: boolean;
  setSelectedSubMenu: React.Dispatch<React.SetStateAction<string | undefined>>;
  decidingCounts: DecidingCount | undefined;
}

export default function Toolbar({ address, decidingCounts, menuOpen, selectedTopMenu, setMenuOpen, setSelectedSubMenu, setSelectedTopMenu }: Props): React.ReactElement {
  const { t } = useTranslation();
  const api = useApi(address);

  const [openSubmitReferendum, setOpenSubmitReferendum] = React.useState(false);
  const [openDelegate, setOpenDelegate] = React.useState(false);
  const [showDelegationNote, setShowDelegationNote] = React.useState<boolean>(true);

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
    setSelectedTopMenu(item);
    setMenuOpen(true);
  }, [setMenuOpen, setSelectedTopMenu]);

  const handleClickAway = useCallback(() => {
    setMenuOpen(false);
  }, [setMenuOpen]);

  function TopMenuComponent({ item }: { item: TopMenu }): React.ReactElement<{ item: TopMenu }> {
    return (
      <Grid alignItems='center' container item justifyContent='center' onMouseEnter={() => onTopMenuMenuMouseEnter(item)} sx={{ mt: '3.5px', px: '5px', bgcolor: selectedTopMenu === item ? 'background.paper' : 'primary.main', color: selectedTopMenu === item ? 'primary.main' : 'white', width: '150px', height: '48px', cursor: 'pointer' }}>
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
      <Grid container id='menu' sx={{ bgcolor: 'primary.main', height: '51.5px', color: 'text.secondary', fontSize: '20px', fontWeight: 500 }}>
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
                  backgroundColor: 'background.paper',
                  borderRadius: '5px',
                  color: 'primary.main',
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
                  backgroundColor: 'background.paper',
                  borderRadius: '5px',
                  color: 'primary.main',
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
      {menuOpen && selectedTopMenu === 'Referenda' &&
        <ReferendaMenu address={address} decidingCounts={decidingCounts?.referenda} setMenuOpen={setMenuOpen} setSelectedSubMenu={setSelectedSubMenu} />
      }
      {menuOpen && selectedTopMenu === 'Fellowship' &&
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
