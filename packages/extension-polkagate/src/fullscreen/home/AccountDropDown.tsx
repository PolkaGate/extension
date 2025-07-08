// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MoreVert } from '@mui/icons-material';
import { ClickAwayListener, Grid, type SxProps, type Theme } from '@mui/material';
import { ArrowCircleDown2, Data, DocumentDownload, Edit, LogoutCurve, Setting4, User } from 'iconsax-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import DropMenuContent from '@polkadot/extension-polkagate/src/components/DropMenuContent';
import useAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import { windowOpen } from '@polkadot/extension-polkagate/src/messaging';
import { ExtensionPopups } from '@polkadot/extension-polkagate/src/util/constants';

import { useIsExtensionPopup, useTranslation } from '../../hooks';
import Receive from '../accountDetails/rightColumn/Receive';
import ExportAccount from '../settings/partials/ExportAccount';
import RemoveAccount from './RemoveAccount';
import RenameAccount from './RenameAccount';

interface Props {
  address: string | undefined;
  disabled?: boolean;
  iconSize?: string;
  name: string | undefined;
  style?: SxProps<Theme>;
}

function AccountDropDown ({ address, disabled, iconSize = '25px', name, style }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();
  const genesisHash = useAccountSelectedChain(address);

  const [hovered, setHovered] = useState<boolean>(false);
  const [open, setOpenDropDown] = useState<boolean>(false);
  const [popup, setPopup] = useState<ExtensionPopups>(ExtensionPopups.NONE);

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
        value: () => windowOpen(`/proxyManagement/${address}/${genesisHash}`)
      }
    ];
  }, [address, genesisHash, t]);

  const extraFullscreenOptions = useMemo(() => {
    return [
      {
        isLine: true
      },
      {
        Icon: ArrowCircleDown2,
        text: t('Receive'),
        value: () => setPopup(ExtensionPopups.RECEIVE)
      },
      {
        Icon: Edit,
        text: t('Rename'),
        value: () => setPopup(ExtensionPopups.RENAME)
      },
      {
        isLine: true
      },
      {
        Icon: DocumentDownload,
        text: t('Export account'),
        value: () => setPopup(ExtensionPopups.EXPORT)
      },
      {
        Icon: LogoutCurve,
        text: t('Remove account'),
        value: () => setPopup(ExtensionPopups.REMOVE)
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
        value: `/settings-account/${address}`
      }
    ];
  }, [address, t]);

  const _options = useMemo(() => {
    return [
      ...baseOption,
      ...(isExtension ? extraExtensionOptions : extraFullscreenOptions)
    ];
  }, [baseOption, extraExtensionOptions, extraFullscreenOptions, isExtension]);

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
          sx={{ background: hovered || open ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)' : '#05091C', border: '3px solid #1B133C', borderRadius: '10px', cursor: 'pointer', height: '36px', transition: 'all 0.2s ease-in-out', width: '36px', ...style }}
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
      {
        popup === ExtensionPopups.RENAME &&
        <RenameAccount
          address={address}
          open={popup}
          setPopup={setPopup}
        />
      }
      {
        popup === ExtensionPopups.REMOVE &&
        <RemoveAccount
          address={address}
          open={popup}
          setPopup={setPopup}
        />
      }
      {
        popup === ExtensionPopups.EXPORT &&
        <ExportAccount
          address={address}
          name={name}
          open={popup}
          setPopup={setPopup}
        />
      }
      {
        popup === ExtensionPopups.RECEIVE &&
        <Receive
          address={address}
          open={!!popup}
          setOpen={setPopup}
        />
      }
    </>
  );
}

export default AccountDropDown;
