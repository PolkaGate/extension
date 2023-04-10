// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { KeypairType } from '@polkadot/util-crypto/types';

import { faEdit, faFileExport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Slide, useTheme } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';

import { ActionContext, Identity, MenuItem, Select, SelectChain } from '../components';
import { useApi, useChain, useEndpoint2, useEndpoints, useFormatted, useGenesisHashOptions, useTranslation } from '../hooks';
import { tieAccount, updateMeta } from '../messaging';
import getLogo from '../util/getLogo';
import { prepareMetaData } from '../util/utils';

interface Props {
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
  isMenuOpen: boolean;
  address: string;
  isHardware: boolean | null | undefined
  isExternal: boolean | null | undefined
  type: KeypairType | undefined;
  name: string | undefined;
}

function AccMenu({ address, isExternal, isHardware, isMenuOpen, name, setShowMenu }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const options = useGenesisHashOptions();
  const chain = useChain(address);
  const formatted = useFormatted(address);
  const [genesisHash, setGenesis] = useState<string | undefined>();
  const endpointOptions = useEndpoints(genesisHash || chain?.genesisHash);
  const api = useApi(address);

  const endpoint = useEndpoint2(address);

  const onAction = useContext(ActionContext);
  const containerRef = React.useRef(null);
  const canDerive = !(isExternal || isHardware);

  const _onForgetAccount = useCallback(() => {
    onAction(`/forget/${address}/${isExternal}`);
  }, [address, isExternal, onAction]);

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
    const availableGensisHash = newGenesisHash.startsWith('0x') ? newGenesisHash : null;

    address && tieAccount(address, availableGensisHash).catch(console.error);
    setGenesis(availableGensisHash ?? undefined);
  }, [address]);

  const _onRenameAccount = useCallback(() => {
    address && onAction(`/rename/${address}`);
  }, [address, onAction]);

  const _onExportAccount = useCallback(() => {
    address && name && onAction(`/export/${address}`);
  }, [address, name, onAction]);

  const _onManageProxies = useCallback(() => {
    address && chain && onAction(`/manageProxies/${address}`);
  }, [address, chain, onAction]);

  const _onChangeEndpoint = useCallback((newEndpoint?: string | undefined): void => {
    const chainName = chain?.name?.replace(' Relay Chain', '')?.replace(' Network', '');

    // eslint-disable-next-line no-void
    chainName && address && void updateMeta(address, prepareMetaData(chainName, 'endpoint', newEndpoint));
  }, [address, chain?.name]);

  const movingParts = (
    <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item mt='46px' px='46px' sx={{ borderRadius: '10px 10px 0px 0px', height: 'parent.innerHeight' }} width='100%'>
      <Grid container justifyContent='center' my='20px' pl='25px'>
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
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px' }} />
      <MenuItem
        iconComponent={
          <FontAwesomeIcon
            color={theme.palette.text.primary}
            icon={faFileExport}
          />
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
          <FontAwesomeIcon
            color={theme.palette.text.primary}
            icon={faEdit}
          />
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
      {endpoint &&
        <Select
          _mt='10px'
          label={t<string>('Remote node')}
          onChange={_onChangeEndpoint}
          options={endpointOptions.length > 0 ? endpointOptions : [{ text: 'No chain selected', value: '' }]}
          value={endpoint ?? 'No chain selected'}
        />
      }
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
    <Grid bgcolor={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'} container height='100%' justifyContent='end' ref={containerRef} sx={[{ mixBlendMode: 'normal', ml: '-15px', overflowY: 'scroll', position: 'fixed', top: 0 }]} width='357px' zIndex={10}>
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

export default React.memo(AccMenu);
