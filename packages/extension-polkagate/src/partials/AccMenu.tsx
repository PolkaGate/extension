// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@vaadin/icons';

import type { IconTheme } from '@polkadot/react-identicon/types';
import type { KeypairType } from '@polkadot/util-crypto/types';

import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Slide, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { sitemap, sitemapB } from '../assets/icons';
import { ActionContext, DropdownWithIcon, Identicon, MenuItem, Select, SettingsContext } from '../components';
import { useEndpoint, useEndpoints, useGenesisHashOptions, useToast, useTranslation } from '../hooks';
import { getMetadata, tieAccount, updateMeta } from '../messaging';
import getLogo from '../util/getLogo';
import { prepareMetaData } from '../util/utils';

interface Props {
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
  isMenuOpen: boolean;
  chain: Chain | null;
  formatted: string | undefined;
  address: string | null;
  isHardware: boolean | null | undefined
  isExternal: boolean | null | undefined
  type: KeypairType | undefined;
  name: string | undefined;
}

function AccMenu({ address, chain, formatted, isExternal, isHardware, isMenuOpen, name, setShowMenu, type }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const settings = useContext(SettingsContext);
  const { show } = useToast();
  const options = useGenesisHashOptions();
  const [newChain, setNewChain] = useState<Chain | null | undefined>();
  const [genesisHash, setGenesis] = useState<string | undefined>('');
  const endpointOptions = useEndpoints(genesisHash || newChain?.genesisHash || chain?.genesisHash);

  const currentChain = newChain ?? chain;
  const endpoint = useEndpoint(address, currentChain);
  const [newEndpoint, setNewEndpoint] = useState<string | undefined>(endpoint);

  const onAction = useContext(ActionContext);
  const containerRef = React.useRef(null);
  const canDerive = !(isExternal || isHardware);
  const prefix = chain ? chain.ss58Format : (settings.prefix === -1 ? 42 : settings.prefix);

  const resetToDefaults = () => {
    setNewEndpoint(undefined);
  };

  const _onForgetAccount = useCallback(() => {
    onAction(`/forget/${address}/${isExternal}`);
  }, [address, isExternal, onAction]);

  useEffect(() => {
    !newEndpoint && endpointOptions?.length && setNewEndpoint(endpointOptions[0].value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newEndpoint, genesisHash]);

  const _closeMenu = useCallback(
    () => setShowMenu((isMenuOpen) => !isMenuOpen),
    [setShowMenu]
  );

  const identiconTheme = (
    (chain?.definition.chainType === 'ethereum' ||
      type === 'ethereum')
      ? 'ethereum'
      : (chain?.icon || 'polkadot')
  ) as IconTheme;

  const _onCopy = useCallback(
    () => show(t('Copied')),
    [show, t]
  );

  const _onChangeNetwork = useCallback(
    (newGenesisHash: string) => {
      resetToDefaults();
      address && tieAccount(address, newGenesisHash || null).catch(console.error);
      setGenesis(newGenesisHash);
    },
    [address]
  );

  useEffect(() => {
    genesisHash && getMetadata(genesisHash, true).then(setNewChain).catch((error): void => {
      console.error(error);
      setNewChain(null);
    });
  }, [genesisHash]);

  const _onChangeEndpoint = useCallback((newEndpoint?: string | undefined): void => {
    setNewEndpoint(newEndpoint);
    const chainName = chain?.name?.replace(' Relay Chain', '')?.replace(' Network', '');

    // eslint-disable-next-line no-void
    chainName && address && void updateMeta(address, prepareMetaData(chainName, 'endpoint', newEndpoint));
  }, [address, chain?.name]);

  const movingParts = (
    <Grid
      alignItems='flex-start'
      bgcolor='background.default'
      container
      display='block'
      item
      mt='46px'
      px='46px'
      sx={{ borderRadius: '10px 10px 0px 0px', height: 'parent.innerHeight' }}
      width='100%'
    >
      <Grid
        container
        justifyContent='center'
        my='20px'
      >
        <Identicon
          className='identityIcon'
          iconTheme={identiconTheme}
          isExternal={isExternal}
          onCopy={_onCopy}
          prefix={prefix}
          size={40}
          value={formatted || address}
        />
        <Grid
          item
          pl='10px'
          sx={{ flexWrap: 'nowrap', maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          <Typography
            fontSize='28px'
            fontWeight={400}
            lineHeight={1.4}
          >
            {name}
          </Typography>
        </Grid>
      </Grid>
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px' }} />
      <MenuItem
        iconComponent={
          <vaadin-icon icon='vaadin:piggy-bank-coin' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
        }
        // onClick={_goToDeriveAcc}
        text={t('Contribute to crowdloans')}
      />
      <MenuItem
        iconComponent={
          <vaadin-icon icon='vaadin:sitemap' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
        }
        // onClick={onnn}
        text={t('Manage proxies')}
      />
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px' }} />
      <MenuItem
        iconComponent={
          <FontAwesomeIcon
            color={theme.palette.text.primary}
            icon={faFileExport} />
        }
        // onClick={onnn}
        text={t('Export account')}
      />
      {canDerive &&
        <MenuItem
          icon={theme.palette.mode === 'dark' ? sitemap : sitemapB}
          iconComponent={
            <vaadin-icon icon='vaadin:road-branch' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
          }
          // onClick={_goToDeriveAcc}
          text={t('Derive new account')}
        />
      }
      <MenuItem
        iconComponent={
          <vaadin-icon icon='vaadin:edit' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
        }
        // onClick={onnn}
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
      <DropdownWithIcon
        defaultValue={chain?.genesisHash ?? options[0].text}
        icon={getLogo(newChain || chain || undefined)}
        label={t<string>('Select the chain')}
        onChange={_onChangeNetwork}
        options={options}
        style={{ width: '100%' }}
      />
      {newEndpoint &&
        <Select
          _mt='10px'
          defaultValue={newEndpoint ?? 'No chain selected'}
          label={t<string>('Endpoint')}
          onChange={_onChangeEndpoint}
          options={endpointOptions.length > 0 ? endpointOptions : [{ text: 'No chain selected', value: '' }]}
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
    <Grid
      bgcolor={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'}
      container
      height='100%'
      justifyContent='end'
      ref={containerRef}
      sx={[{
        mixBlendMode: 'normal',
        ml: '-15px',
        overflowY: 'scroll',
        position: 'fixed',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
          display: 'none',
          width: 0
        },
        top: 0
      }]}
      width='357px'
      zIndex={10}
    >
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
