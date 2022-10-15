// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IconTheme } from '@polkadot/react-identicon/types';

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Slide, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AccountJson } from '@polkadot/extension-base/background/types';
import { Chain } from '@polkadot/extension-chains/types';

import { crowdloans, crowdloansB, sitemap, sitemapB } from '../assets/icons';
import { AccountContext, ActionContext, DropdownWithIcon, Identicon, MenuItem, Select, SettingsContext } from '../components';
import { useEndpoints, useGenesisHashOptions, useToast, useTranslation } from '../hooks';
import { getMetadata } from '../messaging';
import getLogo from '../util/getLogo';

interface Props {
  className?: string;
  reference: React.MutableRefObject<null>;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
  isMenuOpen: boolean;
  account: AccountJson | null;
  chain: Chain | null;
  address: string | null;
}

function AccMenu({ account, address, chain, className, isMenuOpen, setShowMenu }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const settings = useContext(SettingsContext);
  const { show } = useToast();
  const options = useGenesisHashOptions();
  const [newChain, setNewChain] = useState<Chain | null>(null);
  const [genesisHash, setGenesis] = useState<string | undefined>('');
  const endpointOptions = useEndpoints(genesisHash);

  const onAction = useContext(ActionContext);
  const containerRef = React.useRef(null);

  const prefix = chain ? chain.ss58Format : (settings.prefix === -1 ? 42 : settings.prefix);

  const _closeMenu = useCallback(
    () => setShowMenu((isMenuOpen) => !isMenuOpen),
    [setShowMenu]
  );

  const _goToDeriveAcc = useCallback(
    () => {
      onAction(`/account/derive/${account.address}/locked`);
    }, [account?.address, onAction]
  );

  const identiconTheme = (
    (chain?.definition.chainType === 'ethereum' ||
      account?.type === 'ethereum')
      ? 'ethereum'
      : (chain?.icon || 'polkadot')
  ) as IconTheme;

  const _onCopy = useCallback(
    () => show(t('Copied')),
    [show, t]
  );

  const _onChangeNetwork = useCallback(
    (newGenesisHash: string) => setGenesis(newGenesisHash),
    []
  );

  useEffect(() => {
    genesisHash && getMetadata(genesisHash, true).then(setNewChain).catch((error): void => {
      console.error(error);
      setNewChain(null);
    });
  }, [genesisHash]);

  const movingParts = (
    <Grid
      alignItems='flex-start'
      bgcolor='background.default'
      container
      display='block'
      item
      mt='46px'
      px='46px'
      sx={{ height: 'parent.innerHeight', borderRadius: '10px 10px 0px 0px' }}
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
          isExternal={account?.isExternal}
          onCopy={_onCopy}
          prefix={prefix}
          size={40}
          value={address}
        />
        <Grid
          item
          ml='10px'
        >
          <Typography
            fontSize='28px'
            fontWeight={300}
            lineHeight={1.4}
          >
            {account?.name}
          </Typography>
        </Grid>
      </Grid>
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px' }} />
      <MenuItem
        icon={theme.palette.mode === 'dark' ? crowdloans : crowdloansB}
        // onClick={_goToDeriveAcc}
        text={t('Crowdloans')}
      />
      <MenuItem
        icon={theme.palette.mode === 'dark' ? sitemap : sitemapB}
        // onClick={onnn}
        text={t('Manage proxies')}
      />
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px' }} />
      <MenuItem
        icon={theme.palette.mode === 'dark' ? sitemap : sitemapB}
        // onClick={onnn}
        text={t('Export account')}
      />
      <MenuItem
        icon={theme.palette.mode === 'dark' ? sitemap : sitemapB}
        // onClick={_goToDeriveAcc}
        text={t('Derive new account')}
      />
      <MenuItem
        icon={theme.palette.mode === 'dark' ? sitemap : sitemapB}
        // onClick={onnn}
        text={t('Rename')}
      />
      <MenuItem
        icon={theme.palette.mode === 'dark' ? sitemap : sitemapB}
        // onClick={onnn}
        text={t('Forget account')}
      />
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px' }} />
      <DropdownWithIcon
        defaultValue={options[0].text}
        icon={getLogo(newChain ?? undefined)}
        label={t<string>('Select the chain')}
        onChange={_onChangeNetwork}
        options={options}
        style={{ width: '100%' }}
      />
      <Select
        defaultValue={endpointOptions.length > 0 ? endpointOptions[0].text : 'No chain selected'}
        label={t<string>('Endpoint')}
        onChange={() => null}
        options={endpointOptions.length > 0 ? endpointOptions : [{ text: 'No chain selected', value: '' }]}
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
    <Grid
      bgcolor={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'}
      container
      height='100%'
      justifyContent='end'
      ref={containerRef}
      sx={[{
        position: 'fixed',
        top: 0,
        ml: '-15px',
        mixBlendMode: 'normal',
        overflowY: 'scroll',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
          display: 'none',
          width: 0
        }
      }]}
      width='357px'
      zIndex={10}
    >
      <Slide
        container={containerRef.current}
        direction='up'
        in={isMenuOpen}
      >
        {movingParts}
      </Slide>
    </Grid>
  );
}

export default React.memo(AccMenu);
