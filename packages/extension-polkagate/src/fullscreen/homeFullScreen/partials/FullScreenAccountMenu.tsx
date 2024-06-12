// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { faAddressCard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, Popover, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { ActionContext, MenuItem, SocialRecoveryIcon } from '../../../components';
import { useInfo, useTranslation } from '../../../hooks';
import { IDENTITY_CHAINS, PROXY_CHAINS, SOCIAL_RECOVERY_CHAINS } from '../../../util/constants';
import { POPUPS_NUMBER } from './AccountInformationForHome';

interface Props {
  address: string | undefined;
  baseButton: React.ReactNode;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
}

function FullScreenAccountMenu({ address, baseButton, setDisplayPopup }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();
  const { account, chain } = useInfo(address);
  const onAction = useContext(ActionContext);

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const hasPrivateKey = !(account?.isExternal || account?.isHardware);

  const onForgetAccount = useCallback(() => {
    account && setDisplayPopup(POPUPS_NUMBER.FORGET_ACCOUNT);
    handleClose();
  }, [account, handleClose, setDisplayPopup]);

  const goToDeriveAcc = useCallback(() => {
    address && setDisplayPopup(POPUPS_NUMBER.DERIVE_ACCOUNT);
    handleClose();
  }, [address, handleClose, setDisplayPopup]);

  const onRenameAccount = useCallback(() => {
    address && setDisplayPopup(POPUPS_NUMBER.RENAME);
    handleClose();
  }, [address, handleClose, setDisplayPopup]);

  const onExportAccount = useCallback(() => {
    address && setDisplayPopup(POPUPS_NUMBER.EXPORT_ACCOUNT);
    handleClose();
  }, [address, handleClose, setDisplayPopup]);

  const onManageProxies = useCallback(() => {
    address && chain && onAction(`/fullscreenProxyManagement/${address}`);
  }, [address, chain, onAction]);

  const onManageId = useCallback(() => {
    address && onAction(`/manageIdentity/${address}`);
  }, [address, onAction]);

  const onSocialRecovery = useCallback(() => {
    address && onAction(`/socialRecovery/${address}/false`);
  }, [address, onAction]);

  const isDisable = useCallback((supportedChains: string[]) => {
    if (!chain) {
      return true;
    } else {
      return !supportedChains.includes(chain.genesisHash ?? '');
    }
  }, [chain]);

  const AccountMenu = () => (
    <Grid alignItems='flex-start' container display='block' item sx={{ borderRadius: '10px', minWidth: '300px', p: '10px' }}>
      <MenuItem
        disabled={isDisable(IDENTITY_CHAINS)}
        iconComponent={
          <FontAwesomeIcon
            color={isDisable(IDENTITY_CHAINS) ? theme.palette.text.disabled : theme.palette.text.primary}
            fontSize={20}
            icon={faAddressCard}
          />
        }
        onClick={onManageId}
        text={t('Manage identity')}
        withHoverEffect
      />
      <MenuItem
        disabled={isDisable(PROXY_CHAINS)}
        iconComponent={
          <vaadin-icon icon='vaadin:sitemap' style={{ height: '20px', color: `${isDisable(PROXY_CHAINS) ? theme.palette.text.disabled : theme.palette.text.primary}` }} />
        }
        onClick={onManageProxies}
        text={t<string>('Manage proxies')}
        withHoverEffect
      />
      <MenuItem
        disabled={isDisable(SOCIAL_RECOVERY_CHAINS)}
        iconComponent={
          <SocialRecoveryIcon
            color={
              isDisable(SOCIAL_RECOVERY_CHAINS)
                ? theme.palette.text.disabled
                : theme.palette.text.primary}
            height={24}
            width={24}
          />
        }
        onClick={onSocialRecovery}
        text={t('Social recovery')}
        withHoverEffect
      />
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px' }} />
      {hasPrivateKey &&
        <MenuItem
          iconComponent={
            <vaadin-icon icon='vaadin:download-alt' style={{ height: '20px', color: `${theme.palette.text.primary}` }} />
          }
          onClick={onExportAccount}
          text={t('Export account')}
          withHoverEffect
        />
      }
      {hasPrivateKey &&
        <MenuItem
          iconComponent={
            <vaadin-icon icon='vaadin:road-branch' style={{ height: '20px', color: `${theme.palette.text.primary}` }} />
          }
          onClick={goToDeriveAcc}
          text={t('Derive new account')}
          withHoverEffect
        />
      }
      <MenuItem
        iconComponent={
          <vaadin-icon icon='vaadin:edit' style={{ height: '20px', color: `${theme.palette.text.primary}` }} />
        }
        onClick={onRenameAccount}
        text={t('Rename')}
        withHoverEffect
      />
      <MenuItem
        iconComponent={
          <vaadin-icon icon='vaadin:file-remove' style={{ color: `${theme.palette.text.primary}`, height: '20px' }} />
        }
        onClick={onForgetAccount}
        text={t('Forget account')}
        withHoverEffect
      />
    </Grid>
  );

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <Grid aria-describedby={id} component='button' container item onClick={handleClick} sx={{ bgcolor: 'transparent', border: 'none', height: 'fit-content', p: 0, width: 'fit-content' }}>
        {baseButton}
      </Grid>
      <Popover
        PaperProps={{
          sx: { backgroundImage: 'none', bgcolor: 'background.paper', border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'secondary.main' : 'transparent', borderRadius: '7px', boxShadow: theme.palette.mode === 'dark' ? '0px 4px 4px rgba(255, 255, 255, 0.25)' : '0px 0px 25px 0px rgba(0, 0, 0, 0.50)' }
        }}
        anchorEl={anchorEl}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom'
        }}
        id={id}
        onClose={handleClose}
        open={open}
        sx={{ mt: '5px' }}
        transformOrigin={{
          horizontal: 'right',
          vertical: 'top'
        }}
      >
        <AccountMenu />
      </Popover>
    </>
  );
}

export default React.memo(FullScreenAccountMenu);
