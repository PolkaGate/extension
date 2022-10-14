// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IconTheme } from '@polkadot/react-identicon/types';

import { useTheme } from '@emotion/react';
import { Close as CloseIcon } from '@mui/icons-material';
import { Box, Divider, Grid, IconButton, Paper, Slide } from '@mui/material';
import { Theme } from '@mui/material/styles';
import zIndex from '@mui/material/styles/zIndex';
import React, { useCallback, useContext, useState } from 'react';

import { AccountJson } from '@polkadot/extension-base/background/types';
import { Chain } from '@polkadot/extension-chains/types';
import settings from '@polkadot/ui-settings';

import { addCircle, addCircleB, exportIcon, exportIconB, importIcon, importIconB, roadBranch, roadBranchB, setting, settingB } from '../assets/icons';
import { AccountContext, ActionContext, Identicon, MenuItem, SettingsContext } from '../components';
import { useTranslation } from '../hooks';

interface Option {
  text: string;
  value: string;
}

interface Props {
  className?: string;
  reference: React.MutableRefObject<null>;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
  isMenuOpen: boolean;
  account: AccountJson | null;
  chain: Chain | null;
  address: string | null;
}

const notificationOptions = ['Extension', 'PopUp', 'Window']
  .map((item) => ({ text: item, value: item.toLowerCase() }));

const prefixOptions = settings.availablePrefixes
  .filter(({ value }) => value !== -1)
  .map(({ text, value }): Option => ({ text, value: `${value}` }));

function AccMenu ({ account, address, chain, className, isMenuOpen, reference, setShowMenu }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const settings = useContext(SettingsContext);

  const [showImportSubMenu, setShowImportSubMenu] = useState<boolean>(false);
  const [showSettingSubMenu, setShowSettingSubMenu] = useState<boolean>(true);
  const onAction = useContext(ActionContext);
  const { master } = useContext(AccountContext);
  const containerRef = React.useRef(null);

  const prefix = chain ? chain.ss58Format : (settings.prefix === -1 ? 42 : settings.prefix);

  const toggleImportSubMenu = useCallback(() => {
    setShowImportSubMenu(!showImportSubMenu);
    showSettingSubMenu && setShowSettingSubMenu(!showSettingSubMenu);
  }, [showImportSubMenu, showSettingSubMenu]);

  const _goToCreateAcc = useCallback(
    () => {
      onAction('/account/create');
    }, [onAction]
  );

  const _closeMenu = useCallback(
    () => setShowMenu((isMenuOpen) => !isMenuOpen),
    [setShowMenu]
  );

  const _goToDeriveAcc = useCallback(
    () => {
      master && onAction(`/account/derive/${master.address}`);
    }, [master, onAction]
  );

  const identiconTheme = (
    (chain?.definition.chainType === 'ethereum' ||
      account?.type === 'ethereum')
      ? 'ethereum'
      : (chain?.icon || 'polkadot')
  ) as IconTheme;

  const movingParts = (
    <Grid
      alignItems='flex-start'
      bgcolor='background.default'
      container
      display='block'
      item
      mt='46px'
      px='24px'
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
          // onCopy={_onCopy}
          prefix={prefix}
          size={40}
          value={address}
        />
        <Grid
          fontSize='28px'
          item
          ml='10px'
        >
          {`${account?.name}`}
        </Grid>
      </Grid>
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
      <MenuItem
        icon={theme.palette.mode === 'dark' ? roadBranch : roadBranchB}
        onClick={_goToDeriveAcc}
        text={t('Derive from accounts')}
      />
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
      <MenuItem
        icon={theme.palette.mode === 'dark' ? exportIcon : exportIconB}
        // onClick={onnn}
        text={t('Export all accounts')}
      />
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
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
