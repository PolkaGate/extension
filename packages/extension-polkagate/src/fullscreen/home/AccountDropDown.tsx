// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MoreVert } from '@mui/icons-material';
import { ClickAwayListener, Grid, type SxProps, type Theme } from '@mui/material';
import { ArrowCircleDown2, Data, DocumentDownload, Edit, LogoutCurve, Setting4 } from 'iconsax-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import DropMenuContent from '@polkadot/extension-polkagate/src/components/DropMenuContent';
import useAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import { ExtensionPopups } from '@polkadot/extension-polkagate/src/util/constants';

import { useIsExtensionPopup, useTranslation } from '../../hooks';
import Receive from '../accountDetails/rightColumn/Receive';
import ExportAccount from '../settings/partials/ExportAccount';
import RemoveAccount from './RemoveAccount';
import RenameAccount from './RenameAccount';
import { useExtensionPopups } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';

interface Props {
  address: string | undefined;
  disabled?: boolean;
  iconSize?: string;
  isExternal?: boolean | undefined;
  name: string | undefined;
  style?: SxProps<Theme>;
}

function AccountDropDown ({ address, disabled, iconSize = '25px', isExternal, name, style }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();
  const genesisHash = useAccountSelectedChain(address);
  const { extensionPopup, extensionPopupCloser, extensionPopupOpener } = useExtensionPopups();

  const [hovered, setHovered] = useState<boolean>(false);
  const [open, setOpenDropDown] = useState<boolean>(false);

  const onMouseEnter = useCallback(() => setHovered(true), []);
  const onMouseLeave = useCallback(() => setHovered(false), []);

  const baseOption = useMemo(() => {
    return [
      // {
      //   Icon: User,
      //   text: t('Manage Identity'),
      //   value: `/manageIdentity/${address}`
      // },
      {
        Icon: Data,
        text: t('Manage Proxies'),
        value: `/proxyManagement/${address}/${genesisHash}`
      }
    ];
  }, [address, genesisHash, t]);

  const fullscreenExtraOptions = useMemo(() => {
    return [
      {
        isLine: true
      },
      {
        Icon: ArrowCircleDown2,
        text: t('Receive'),
        value: extensionPopupOpener(ExtensionPopups.RECEIVE)
      },
      {
        Icon: Edit,
        text: t('Rename'),
        value: extensionPopupOpener(ExtensionPopups.RENAME)
      },
      {
        isLine: true
      },
      ...(isExternal ? [] : [{
        Icon: DocumentDownload,
        text: t('Export account'),
        value: extensionPopupOpener(ExtensionPopups.EXPORT)
      }]),
      {
        Icon: LogoutCurve,
        text: t('Remove account'),
        value: extensionPopupOpener(ExtensionPopups.REMOVE)
      }
    ];
  }, [t]);

  const extensionExtraOptions = useMemo(() => {
    return [
      {
        isLine: true
      },
      {
        Icon: Setting4,
        pathname: '/accounts',
        text: t('Account Settings'),
        value: `/settings-account/${address}`
      }
    ];
  }, [address, t]);

  const _options = useMemo(() => {
    return [
      ...baseOption,
      ...(isExtension ? extensionExtraOptions : fullscreenExtraOptions)
    ];
  }, [baseOption, extensionExtraOptions, fullscreenExtraOptions, isExtension]);

  const toggleOpen = useCallback(() => !disabled && setOpenDropDown((isOpen) => !isOpen), [disabled]);
  const handleClickAway = useCallback(() => setOpenDropDown(false), []);

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Grid
          alignItems='center'
          container item justifyContent='center' onClick={toggleOpen}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          ref={containerRef}
          sx={{ background: hovered || open ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)' : '#05091C', border: '2px solid #1B133C', borderRadius: '12px', cursor: 'pointer', height: '36px', transition: 'all 0.2s ease-in-out', width: '36px', ...style }}
        >
          <MoreVert sx={{ color: hovered || open ? '#EAEBF1' : '#AA83DC', fontSize: iconSize }} />
        </Grid>
      </ClickAwayListener>
      <DropMenuContent
        containerRef={containerRef}
        open={open}
        options={_options}
        setOpen={setOpenDropDown}
      />
      {extensionPopup === ExtensionPopups.RENAME &&
        <RenameAccount
          address={address}
          onClose={extensionPopupCloser}
        />}
      {extensionPopup === ExtensionPopups.REMOVE &&
        <RemoveAccount
          address={address}
          onClose={extensionPopupCloser}
        />}
      {extensionPopup === ExtensionPopups.EXPORT &&
        <ExportAccount
          address={address}
          name={name}
          onClose={extensionPopupCloser}
        />}
      {extensionPopup === ExtensionPopups.RECEIVE &&
        <Receive
          address={address}
          closePopup={extensionPopupCloser}
        />}
    </>
  );
}

export default React.memo(AccountDropDown);
