// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ClickAwayListener, Grid, styled, type SxProps, type Theme, useTheme } from '@mui/material';
import { AddCircle, ArrowDown2, Broom, ExportCurve, ImportCurve, Setting, User } from 'iconsax-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { isEthereumAddress } from '@polkadot/util-crypto';

import DeriveAccount from '../fullscreen/home/DeriveAccount';
import ExportAllAccounts from '../fullscreen/home/ExportAllAccounts';
import { useSelectedAccount, useTranslation } from '../hooks';
import { ExtensionPopups } from '../util/constants';
import { useExtensionPopups } from '../util/handleExtensionPopup';
import DropMenuContent from './DropMenuContent';

const DropSelectContainer = styled(Grid, {
  shouldForwardProp: (prop) => prop !== 'focused'
})<{ focused: boolean }>(({ focused, theme }) => ({
  ':hover': { background: theme.palette.mode === 'dark' ? '#674394' : '#F3F6FD' },
  alignItems: 'center',
  backdropFilter: 'blur(20px)',
  background: focused ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)' : theme.palette.mode === 'dark' ? '#1B133C' : '#FFFFFF',
  border: focused ? 'none' : `1px solid ${theme.palette.mode === 'dark' ? 'transparent' : '#DDE3F4'}`,
  borderRadius: '12px',
  boxShadow: theme.palette.mode === 'dark' ? '0px 0px 24px 8px #4E2B7259 inset' : '0px 8px 22px rgba(133, 140, 176, 0.12)',
  columnGap: '2px',
  cursor: 'pointer',
  justifyContent: 'center',
  transition: 'all 250ms ease-out'
}));

interface Props {
  style?: SxProps<Theme>;
}

function HomeAccountDropDown({ style }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const { extensionPopup, extensionPopupCloser, extensionPopupOpener } = useExtensionPopups();
  const selectedAccount = useSelectedAccount();
  const isEthereum = isEthereumAddress(selectedAccount?.address);

  const _options = useMemo(() => {
    const OPTIONS = [
      {
        Icon: AddCircle,
        text: t('Create New Account'),
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
        Icon: ExportCurve,
        text: t('Export All Accounts'),
        value: extensionPopupOpener(ExtensionPopups.EXPORT)
      }
    ];

 
    if (!isEthereum && !selectedAccount?.isExternal) {
      OPTIONS.push({
        Icon: Broom,
        text: t('Derive New Account'),
        value: extensionPopupOpener(ExtensionPopups.DERIVE)
      }
      );
    }

    return OPTIONS;
  }, [extensionPopupOpener, isEthereum, selectedAccount?.isExternal, t]);

  const [open, setOpen] = useState<boolean>(false);

  const toggleOpen = useCallback(() => setOpen((isOpen) => !isOpen), []);
  const handleClickAway = useCallback(() => setOpen(false), []);

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <DropSelectContainer container focused={open} item onClick={toggleOpen} ref={containerRef} sx={style}>
          <User color={open ? '#EAEBF1' : theme.palette.mode === 'dark' ? '#AA83DC' : theme.palette.text.secondary} size='18' variant='Bulk' />
          <ArrowDown2 color={open ? '#EAEBF1' : theme.palette.mode === 'dark' ? '#AA83DC' : theme.palette.text.secondary} size='16' style={{ rotate: open ? '180deg' : 'none', transition: 'all 250ms ease-out' }} variant='Bold' />
        </DropSelectContainer>
      </ClickAwayListener>
      <DropMenuContent
        containerRef={containerRef}
        open={open}
        options={_options}
        setOpen={setOpen}
      />
      {extensionPopup === ExtensionPopups.EXPORT &&
        <ExportAllAccounts
          onClose={extensionPopupCloser}
        />
      }
      {extensionPopup === ExtensionPopups.DERIVE &&
        <DeriveAccount
          closePopup={extensionPopupCloser}
        />
      }
    </>
  );
}

export default HomeAccountDropDown;
