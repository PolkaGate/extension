// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MoreVert } from '@mui/icons-material';
import { ClickAwayListener, Grid, type SxProps, type Theme } from '@mui/material';
import { Data, Edit, LogoutCurve, Setting4, Shield, User } from 'iconsax-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import DropMenuContent from '@polkadot/extension-polkagate/src/components/DropMenuContent';

import { useIsExtensionPopup, useTranslation } from '../../hooks';
import RemoveAccount from './RemoveAccount';
import RenameAccount from './RenameAccount';

interface Props {
  address: string | undefined;
  disabled?: boolean;
  iconSize?: string;
  style?: SxProps<Theme>;
}

enum ACCOUNT_POPUP {
  RENAME,
  REMOVE
}

function AccountDropDown ({ address, disabled, iconSize = '25px', style }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();

  const [hovered, setHovered] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [popup, setPopup] = useState<ACCOUNT_POPUP>();

  const onMouseEnter = useCallback(() => setHovered(true), []);
  const onMouseLeave = useCallback(() => setHovered(false), []);

  const baseOption = useMemo(() => {
    return [
      {
        Icon: User,
        text: t('Manage Identity'),
        value: `/manageIdentity/${address}`
      },
      {
        Icon: Data,
        text: t('Manage proxies'),
        value: `/fullscreenProxyManagement/${address}`
      },
      {
        Icon: Shield,
        text: t('Social recovery'),
        value: `/socialRecovery/${address}/false`
      }
    ];
  }, [address, t]);

  const extraFullscreenOptions = useMemo(() => {
    return [
      {
        isLine: true
      },
      {
        Icon: Edit,
        text: t('Rename'),
        value: () => setPopup(ACCOUNT_POPUP.RENAME)
      },
      {
        isLine: true
      },
      {
        Icon: LogoutCurve,
        text: t('Remove account'),
        value: () => setPopup(ACCOUNT_POPUP.REMOVE)
      }
    ];
  }, [t]);

  const extraExtensionOptions = useMemo(() => {
    return [
      {
        isLine: true
      },
      {
        Icon: Setting4,
        pathname: '/accounts',
        text: t('Account settings'),
        value: '/settings-account'
      }
    ];
  }, [t]);

  const _options = useMemo(() => {
    return [
      ...baseOption,
      ...(isExtension ? extraExtensionOptions : extraFullscreenOptions)
    ];
  }, [baseOption, extraExtensionOptions, extraFullscreenOptions, isExtension]);

  const toggleOpen = useCallback(() => !disabled && setOpen((isOpen) => !isOpen), [disabled]);
  const handleClickAway = useCallback(() => setOpen(false), []);

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Grid
          alignItems='center'
          container item justifyContent='center' onClick={toggleOpen}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          ref={containerRef}
          sx={{ background: hovered || open ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)' : '#05091C', border: '3px solid #1B133C', borderRadius: '10px', cursor: 'pointer', height: '36px', transition: 'all 0.2s ease-in-out', width: '36px', ...style }}
        >
          <MoreVert sx={{ color: hovered || open ? '#EAEBF1' : '#AA83DC', fontSize: iconSize }} />
        </Grid>
      </ClickAwayListener>
      <DropMenuContent
        containerRef={containerRef}
        open={open}
        options={_options}
        setOpen={setOpen}
      />
      {
        popup === ACCOUNT_POPUP.RENAME &&
        <RenameAccount
          address={address}
          open={popup}
          setPopup={setPopup}
        />
      }
      {
        popup === ACCOUNT_POPUP.REMOVE &&
        <RemoveAccount
          address={address}
          open={popup}
          setPopup={setPopup}
        />
      }
    </>
  );
}

export default AccountDropDown;
