// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faAddressCard, faGem } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, Popover, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { ActionContext, MenuItem, SocialRecoveryIcon, VaadinIcon } from '../../../components';
import { useInfo, useTranslation } from '../../../hooks';
import { IDENTITY_CHAINS, PROXY_CHAINS, SOCIAL_RECOVERY_CHAINS } from '../../../util/constants';
import { POPUPS_NUMBER } from './AccountInformationForHome';
import ProfileMenu from './ProfileMenu';

interface Props {
  address: string | undefined;
  baseButton: React.ReactNode;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
}

const Menus = ({ address, handleClose, setDisplayPopup }: {
  address: string | undefined,
  handleClose: () => void,
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  const { account, chain } = useInfo(address);
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

  const onNFTAlbum = useCallback(() => {
    address && onAction(`/nft/${address}`);
  }, [address, onAction]);

  const isDisable = useCallback((supportedChains: string[]) => {
    if (!chain) {
      return true;
    } else {
      return !supportedChains.includes(chain.genesisHash ?? '');
    }
  }, [chain]);

  const vaadinIconStyle = { color: `${theme.palette.text.primary}`, height: '20px' };

  return (
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
          <VaadinIcon icon='vaadin:sitemap' style={{ color: `${isDisable(PROXY_CHAINS) ? theme.palette.text.disabled : theme.palette.text.primary}`, height: '20px' }} />
        }
        onClick={onManageProxies}
        text={t('Manage proxies')}
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
      <MenuItem
        disabled={false} // We check NFTs across all supported chains, so this feature is not specific to the current chain and should not be disabled.
        iconComponent={
          <FontAwesomeIcon
            color={theme.palette.text.primary}
            fontSize='20px'
            icon={faGem}
          />
        }
        onClick={onNFTAlbum}
        text={t('NFT album')}
        withHoverEffect
      />
      <Divider sx={{ bgcolor: 'divider', height: '1px', my: '6px' }} />
      <ProfileMenu
        address={address}
        closeParentMenu={handleClose}
      />
      {hasPrivateKey &&
        <MenuItem
          iconComponent={
            <VaadinIcon icon='vaadin:download-alt' style={vaadinIconStyle} />
          }
          onClick={onExportAccount}
          text={t('Export account')}
          withHoverEffect
        />
      }
      {hasPrivateKey &&
        <MenuItem
          iconComponent={
            <VaadinIcon icon='vaadin:road-branch' style={vaadinIconStyle} />
          }
          onClick={goToDeriveAcc}
          text={t('Derive new account')}
          withHoverEffect
        />
      }
      <MenuItem
        iconComponent={
          <VaadinIcon icon='vaadin:edit' style={vaadinIconStyle} />
        }
        onClick={onRenameAccount}
        text={t('Rename')}
        withHoverEffect
      />
      <MenuItem
        iconComponent={
          <VaadinIcon icon='vaadin:file-remove' style={vaadinIconStyle} />
        }
        onClick={onForgetAccount}
        text={t('Forget account')}
        withHoverEffect
      />
    </Grid>
  );
};

function FullScreenAccountMenu({ address, baseButton, setDisplayPopup }: Props): React.ReactElement<Props> {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <Grid aria-describedby={id} component='button' container item onClick={handleClick} sx={{ bgcolor: 'transparent', border: 'none', height: 'fit-content', p: 0, width: 'fit-content' }}>
        {baseButton}
      </Grid>
      <Popover
        PaperProps={{
          sx: { backgroundImage: 'none', bgcolor: 'background.paper', border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'secondary.light' : 'transparent', borderRadius: '7px', boxShadow: theme.palette.mode === 'dark' ? '0px 4px 4px rgba(255, 255, 255, 0.25)' : '0px 0px 25px 0px rgba(0, 0, 0, 0.50)' }
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
        <Menus
          address={address}
          handleClose={handleClose}
          setDisplayPopup={setDisplayPopup}
        />
      </Popover>
    </>
  );
}

export default React.memo(FullScreenAccountMenu);
