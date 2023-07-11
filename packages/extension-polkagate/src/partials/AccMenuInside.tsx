// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { faAddressCard } from '@fortawesome/free-regular-svg-icons';
import { faCoins, faEdit, faFileExport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Slide, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import { poolStakingBlack, poolStakingWhite, soloStakingBlack, soloStakingWhite } from '../assets/icons';
import { ActionContext, Identity, MenuItem } from '../components';
import { useAccount, useApi, useChain, useFormatted, useTranslation } from '../hooks';
import { windowOpen } from '../messaging';

interface Props {
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
  isMenuOpen: boolean;
  address: string | null;
}

function AccMenuInside({ address, isMenuOpen, setShowMenu }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const history = useHistory();
  const onAction = useContext(ActionContext);
  const containerRef = React.useRef(null);

  const account = useAccount(address);
  const chain = useChain(address);
  const formatted = useFormatted(address);
  const api = useApi(address);

  const canDerive = !(account?.isExternal || account?.isHardware);

  const _onForgetAccount = useCallback(() => {
    account && onAction(`/forget/${address}/${account?.isExternal}`);
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

  const _onRenameAccount = useCallback(() => {
    address && onAction(`/rename/${address}`);
  }, [address, onAction]);

  const _onExportAccount = useCallback(() => {
    address && onAction(`/export/${address}`);
  }, [address, onAction]);

  const _onManageProxies = useCallback(() => {
    address && onAction(`/manageProxies/${address}`);
  }, [address, onAction]);

  const _onManageId = useCallback(() => {
    address && windowOpen(`/identity/${address}`).catch(console.error);
  }, [address]);

  const goToSoloStaking = useCallback(() => {
    address && history.push({
      pathname: `/solo/${address}/`
    });
  }, [address, history]);

  const goToPoolStaking = useCallback(() => {
    address && history.push({
      pathname: `/pool/${address}/`
    });
  }, [address, history]);

  const movingParts = (
    <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item mt='46px' px='46px' sx={{ borderRadius: '10px 10px 0px 0px', height: 'parent.innerHeight' }} width='100%'>
      <Grid container justifyContent='center' my='20px' pl='25px'>
        <Identity address={address} api={api} chain={chain} formatted={formatted} identiconSize={35} showSocial={false} />
      </Grid>
      <MenuItem
        iconComponent={
          <vaadin-icon icon='vaadin:sitemap' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
        }
        onClick={_onManageProxies}
        text={t('Manage proxies')}
      />
      <MenuItem
        iconComponent={
          <FontAwesomeIcon
            color={theme.palette.text.primary}
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
          <FontAwesomeIcon
            color={theme.palette.text.primary}
            icon={faCoins}
            size='lg'
          />
        }
        text={t('Staking')}
      />
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px', ml: '20px' }} />
      <MenuItem
        iconComponent={
          <img src={theme.palette.mode === 'dark' ? soloStakingWhite : soloStakingBlack} />
        }
        onClick={goToSoloStaking}
        pl='20px'
        text={t('Solo staking')}
      />
      <MenuItem
        iconComponent={
          <img src={theme.palette.mode === 'dark' ? poolStakingWhite : poolStakingBlack} />
        }
        onClick={goToPoolStaking}
        pl='20px'
        text={t('Pool staking')}
      />
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px' }} />
      <MenuItem
        iconComponent={
          <FontAwesomeIcon
            color={theme.palette.text.primary}
            icon={faFileExport} />
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
    <Grid bgcolor={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'} container height='100%' justifyContent='end' ref={containerRef} sx={[{ mixBlendMode: 'normal', overflowY: 'scroll', position: 'fixed', top: 0 }]} width='357px' zIndex={10}>
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

export default React.memo(AccMenuInside);
