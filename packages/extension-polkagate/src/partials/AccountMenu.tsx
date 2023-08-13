// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { faAddressCard } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Slide, useTheme } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';

import { ActionContext, Identity, MenuItem, RemoteNodeSelector, SelectChain } from '../components';
import { useAccount, useApi, useChain, useFormatted, useGenesisHashOptions, useTranslation } from '../hooks';
import { tieAccount, windowOpen } from '../messaging';
import getLogo from '../util/getLogo';
import { IDENTITY_CHAINS, STAKING_CHAINS } from '../util/constants';

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
  const chain = useChain(address);
  const formatted = useFormatted(address);
  const account = useAccount(address);
  const api = useApi(address);

  const [genesisHash, setGenesis] = useState<string | undefined>();

  const onAction = useContext(ActionContext);
  const containerRef = React.useRef(null);
  const canDerive = !(account?.isExternal || account?.isHardware);

  const _onForgetAccount = useCallback(() => {
    onAction(`/forget/${address}/${account.isExternal}`);
  }, [address, account, onAction]);

  const _goToDeriveAcc = useCallback(
    () => {
      address && onAction(`/derive/${address}/locked`);
    }, [address, onAction]
  );

  const _closeMenu = useCallback(
    () => setShowMenu((isMenuOpen) => !isMenuOpen),
    [setShowMenu]
  );

  const _onChangeNetwork = useCallback((newGenesisHash: string) => {
    const availableGenesisHash = newGenesisHash.startsWith('0x') ? newGenesisHash : null;

    address && tieAccount(address, availableGenesisHash).catch(console.error);
    setGenesis(availableGenesisHash ?? undefined);
  }, [address]);

  const _onRenameAccount = useCallback(() => {
    address && onAction(`/rename/${address}`);
  }, [address, onAction]);

  const _onExportAccount = useCallback(() => {
    address && onAction(`/export/${address}`);
  }, [address, onAction]);

  const _onManageProxies = useCallback(() => {
    address && chain && onAction(`/manageProxies/${address}`);
  }, [address, chain, onAction]);

  const _onManageId = useCallback(() => {
    address && windowOpen(`/identity/${address}`).catch(console.error);
  }, [address]);

  const movingParts = (
    <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item mt='46px' px='46px' sx={{ borderRadius: '10px 10px 0px 0px', height: 'parent.innerHeight' }} width='100%'>
      <Grid container item justifyContent='center' my='20px' pl='8px'>
        <Identity address={address} api={api} chain={chain} formatted={formatted} identiconSize={35} showSocial={false} />
      </Grid>
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px' }} />
      <MenuItem
        disabled={!chain}
        iconComponent={
          <vaadin-icon icon='vaadin:sitemap' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
        }
        onClick={_onManageProxies}
        text={t('Manage proxies')}
      />
      <MenuItem
        disabled={!chain || !(IDENTITY_CHAINS.includes(chain.genesisHash ?? ''))}
        iconComponent={
          <FontAwesomeIcon
            color={(!chain || !(IDENTITY_CHAINS.includes(chain.genesisHash ?? ''))) ? theme.palette.text.disabled : theme.palette.text.primary}
            fontSize={19}
            icon={faAddressCard}
          />
        }
        onClick={_onManageId}
        text={t('Manage identity')}
      />
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px' }} />
      <MenuItem
        iconComponent={
          <vaadin-icon icon='vaadin:download-alt' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
        }
        onClick={_onExportAccount}
        text={t('Export account')}
      />
      {canDerive &&
        <MenuItem
          iconComponent={
            <vaadin-icon icon='vaadin:road-branch' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
          }
          onClick={_goToDeriveAcc}
          text={t('Derive new account')}
        />
      }
      <MenuItem
        iconComponent={
          <vaadin-icon icon='vaadin:edit' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
        }
        onClick={_onRenameAccount}
        text={t('Rename')}
      />
      <MenuItem
        iconComponent={
          <vaadin-icon icon='vaadin:file-remove' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
        }
        onClick={_onForgetAccount}
        text={t('Forget account')}
      />
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px' }} />
      <SelectChain
        address={address}
        defaultValue={chain?.genesisHash ?? options[0].text}
        icon={getLogo(chain || undefined)}
        label={t<string>('Chain')}
        onChange={_onChangeNetwork}
        options={options}
        style={{ width: '100%' }}
      />
      <RemoteNodeSelector
        address={address}
        genesisHash={genesisHash}
      />
      <IconButton
        onClick={_closeMenu}
        sx={{
          left: '15px',
          p: 0,
          position: 'absolute',
          top: '65px'
        }}
      >
        <CloseIcon sx={{ color: 'text.primary', fontSize: 35 }} />
      </IconButton>
    </Grid>
  );

  return (
    <Grid bgcolor={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'} container height='100%' justifyContent='end' ref={containerRef} sx={[{ mixBlendMode: 'normal', ml: !noMargin && '-15px', overflowY: 'scroll', position: 'fixed', top: 0 }]} width='357px' zIndex={10}>
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

