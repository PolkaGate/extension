// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { HexString } from '@polkadot/util/types';

import { faAddressCard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Slide, useTheme } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';

import { ActionContext, Identity, MenuItem, RemoteNodeSelector, SelectChain, SocialRecoveryIcon, VaadinIcon } from '../components';
import ProfileMenu from '../fullscreen/homeFullScreen/partials/ProfileMenu';
import { useGenesisHashOptions, useInfo, useTranslation } from '../hooks';
import { tieAccount, windowOpen } from '../messaging';
import { IDENTITY_CHAINS, PROXY_CHAINS, SOCIAL_RECOVERY_CHAINS } from '../util/constants';
import getLogo from '../util/getLogo';

interface Props {
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
  isMenuOpen: boolean;
  address: string;
  noMargin?: boolean;
}

function AccountMenu({ address, isMenuOpen, noMargin, setShowMenu }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const options = useGenesisHashOptions();
  const { account, api, chain, formatted } = useInfo(address);

  const [genesisHash, setGenesis] = useState<string | undefined>();

  const onAction = useContext(ActionContext);
  const containerRef = React.useRef(null);
  const hasPrivateKey = !(account?.isExternal || account?.isHardware);

  const onForgetAccount = useCallback(() => {
    onAction(`/forget/${address}/${account?.isExternal}`);
  }, [address, account, onAction]);

  const goToDeriveAcc = useCallback(() => {
    address && onAction(`/derive/${address}/locked`);
  }, [address, onAction]);

  const closeMenu = useCallback(
    () => setShowMenu((isMenuOpen) => !isMenuOpen),
    [setShowMenu]
  );

  const onChangeNetwork = useCallback((newGenesisHash: string) => {
    const availableGenesisHash = newGenesisHash.startsWith('0x') ? newGenesisHash : null;

    address && tieAccount(address, availableGenesisHash as HexString).catch(console.error);
    setGenesis(availableGenesisHash ?? undefined);
  }, [address]);

  const onRenameAccount = useCallback(() => {
    address && onAction(`/rename/${address}`);
  }, [address, onAction]);

  const onExportAccount = useCallback(() => {
    address && onAction(`/export/${address}`);
  }, [address, onAction]);

  const onManageProxies = useCallback(() => {
    address && chain && PROXY_CHAINS.includes(chain.genesisHash ?? '') && onAction(`/manageProxies/${address}`);
  }, [address, chain, onAction]);

  const onManageId = useCallback(() => {
    address && windowOpen(`/manageIdentity/${address}`).catch(console.error);
  }, [address]);

  const onSocialRecovery = useCallback(() => {
    address && windowOpen(`/socialRecovery/${address}/false`).catch(console.error);
  }, [address]);

  const isDisabled = useCallback((supportedChains: string[]) => {
    if (!chain) {
      return true;
    }

    return !supportedChains.includes(chain.genesisHash ?? '');
  }, [chain]);

  const movingParts = (
    <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item mt={hasPrivateKey ? '30px' : '123px'} px='46px' sx={{ borderRadius: '10px 10px 0px 0px', height: 'parent.innerHeight' }} width='100%'>
      <Grid container item justifyContent='center' mt='7px' pl='8px'>
        <Identity address={address} api={api} chain={chain} formatted={formatted} identiconSize={35} showSocial={false} subIdOnly />
      </Grid>
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
      <MenuItem
        disabled={isDisabled(IDENTITY_CHAINS)}
        iconComponent={
          <FontAwesomeIcon
            color={isDisabled(IDENTITY_CHAINS) ? theme.palette.text.disabled : theme.palette.text.primary}
            fontSize={19}
            icon={faAddressCard}
          />
        }
        onClick={onManageId}
        text={t('Manage identity')}
        withHoverEffect
      />
      <MenuItem
        disabled={isDisabled(PROXY_CHAINS)}
        iconComponent={
          <VaadinIcon icon='vaadin:sitemap' style={{ color: `${isDisabled(PROXY_CHAINS) ? theme.palette.text.disabled : theme.palette.text.primary}`, height: '18px' }} />
        }
        onClick={onManageProxies}
        text={t('Manage proxies')}
        withHoverEffect
      />
      <MenuItem
        disabled={isDisabled(SOCIAL_RECOVERY_CHAINS)}
        iconComponent={
          <SocialRecoveryIcon
            color={
              isDisabled(SOCIAL_RECOVERY_CHAINS)
                ? theme.palette.text.disabled
                : theme.palette.text.primary}
            height={22}
            width={22}
          />
        }
        onClick={onSocialRecovery}
        text={t('Social recovery')}
        withHoverEffect
      />
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
      <ProfileMenu
        address={address}
      />
      {hasPrivateKey &&
        <>
          <MenuItem
            iconComponent={
              <VaadinIcon icon='vaadin:download-alt' style={{ color: `${theme.palette.text.primary}`, height: '18px' }} />
            }
            onClick={onExportAccount}
            text={t('Export account')}
            withHoverEffect
          />
          <MenuItem
            iconComponent={
              <VaadinIcon icon='vaadin:road-branch' style={{ color: `${theme.palette.text.primary}`, height: '18px' }} />
            }
            onClick={goToDeriveAcc}
            text={t('Derive new account')}
            withHoverEffect
          />
        </>
      }
      <MenuItem
        iconComponent={
          <VaadinIcon icon='vaadin:edit' style={{ color: `${theme.palette.text.primary}`, height: '18px' }} />
        }
        onClick={onRenameAccount}
        text={t('Rename')}
        withHoverEffect
      />
      <MenuItem
        iconComponent={
          <VaadinIcon icon='vaadin:file-remove' style={{ color: `${theme.palette.text.primary}`, height: '18px' }} />
        }
        onClick={onForgetAccount}
        text={t('Forget account')}
        withHoverEffect
      />
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
      <SelectChain
        address={address}
        defaultValue={chain?.genesisHash ?? options[0].text}
        icon={getLogo(chain || undefined)}
        label={t('Chain')}
        onChange={onChangeNetwork}
        options={options}
        style={{ width: '100%' }}
      />
      <RemoteNodeSelector
        address={address}
        genesisHash={genesisHash}
      />
      <IconButton
        onClick={closeMenu}
        sx={{
          left: '15px',
          p: 0,
          position: 'absolute',
          top: hasPrivateKey ? '38px' : '135px'
        }}
      >
        <CloseIcon sx={{ color: 'text.primary', fontSize: 35 }} />
      </IconButton>
    </Grid>
  );

  return (
    <Grid bgcolor={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'} container height='100%' justifyContent='end' ref={containerRef} sx={[{ mixBlendMode: 'normal', ml: !noMargin ? '-15px' : undefined, overflowY: 'scroll', position: 'fixed', top: 0 }]} width='357px' zIndex={10}>
      <Slide
        container={containerRef.current}
        direction='up'
        in={isMenuOpen}
        mountOnEnter
        unmountOnExit
      >
        {movingParts}
      </Slide>
    </Grid>
  );
}

export default React.memo(AccountMenu);
