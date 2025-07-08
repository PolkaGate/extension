// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ClickAwayListener, Grid, styled, type SxProps, type Theme } from '@mui/material';
import { AddCircle, ArrowDown2, Broom, ExportCurve, ImportCurve, Setting, User } from 'iconsax-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import ExportAllAccounts from '../fullscreen/home/ExportAllAccounts';
import { useTranslation } from '../hooks';
import DropMenuContent from './DropMenuContent';

const DropSelectContainer = styled(Grid)(({ focused }: { focused: boolean }) => ({
  ':hover': { background: '#674394' },
  alignItems: 'center',
  backdropFilter: 'blur(20px)',
  background: focused ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)' : '#1B133C',
  borderRadius: '12px',
  boxShadow: '0px 0px 24px 8px #4E2B7259 inset',
  columnGap: '2px',
  cursor: 'pointer',
  justifyContent: 'center',
  transition: 'all 250ms ease-out'
}));

interface Props {
  style?: SxProps<Theme>;
}

enum HOME_POPUP {
  DERIVE,
  EXPORT
}

function HomeAccountDropDown ({ style }: Props) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const [popup, setPopup] = useState<HOME_POPUP>();

  const _options = useMemo(() => {
    const OPTIONS = [
      {
        Icon: AddCircle,
        text: t('Create a New Account'),
        value: '/account/create'
      },
      {
        Icon: ImportCurve,
        text: t('Import Account'),
        value: '/account/have-wallet'
      },
      {
        Icon: Setting,
        text: t('Settings'),
        value: '/settingsfs/'
      },
      {
        Icon: Broom,
        text: t('Derive from Accounts'),
        value: '/account/create'
      },
      {
        Icon: ExportCurve,
        text: t('Export all Accounts'),
        value: () => setPopup(HOME_POPUP.EXPORT)
      }
    ];

    return OPTIONS;
  }, [t]);

  const [open, setOpen] = useState<boolean>(false);

  const toggleOpen = useCallback(() => setOpen((isOpen) => !isOpen), []);
  const handleClickAway = useCallback(() => setOpen(false), []);

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <DropSelectContainer container focused={open} item onClick={toggleOpen} ref={containerRef} sx={style}>
          <User color={open ? '#EAEBF1' : '#AA83DC'} size='18' variant='Bulk' />
          <ArrowDown2 color={open ? '#EAEBF1' : '#AA83DC'} size='16' style={{ rotate: open ? '180deg' : 'none', transition: 'all 250ms ease-out' }} variant='Bold' />
        </DropSelectContainer>
      </ClickAwayListener>
      <DropMenuContent
        containerRef={containerRef}
        open={open}
        options={_options}
        setOpen={setOpen}
      />
      {popup === HOME_POPUP.EXPORT &&
        <ExportAllAccounts
          open={popup !== undefined}
          setPopup={setPopup}
        />
      }
    </>
  );
}

export default HomeAccountDropDown;
