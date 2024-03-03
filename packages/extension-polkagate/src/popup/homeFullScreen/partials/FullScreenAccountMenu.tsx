// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { faAddressCard } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, Popover, useTheme } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';

import { ActionContext, Chain, MenuItem, SocialRecoveryIcon } from '../../../components';
import { useAccount, useChain, useGenesisHashOptions, useTranslation } from '../../../hooks';
import { tieAccount } from '../../../messaging';
import { FullScreenRemoteNode } from '../../../partials';
import { IDENTITY_CHAINS, PROXY_CHAINS, SOCIAL_RECOVERY_CHAINS } from '../../../util/constants';
import { POPUPS_NUMBER } from './AccountInformation';

interface Props {
  address: string | undefined;
  baseButton: React.ReactNode;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
}

function FullScreenAccountMenu({ address, baseButton, setDisplayPopup }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();
  const chain = useChain(address);
  const account = useAccount(address);
  const onAction = useContext(ActionContext);
  const options = useGenesisHashOptions();

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [genesisHash, setGenesis] = useState<string | undefined>(chain?.genesisHash);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const isExternalAccount = !(account?.isExternal || account?.isHardware);

  const onForgetAccount = useCallback(() => {
    account && setDisplayPopup(POPUPS_NUMBER.FORGET_ACCOUNT);
    handleClose();
  }, [account, handleClose, setDisplayPopup]);

  const goToDeriveAcc = useCallback(() => {
    address && setDisplayPopup(POPUPS_NUMBER.DERIVE_ACCOUNT);
    handleClose();
  }, [address, handleClose, setDisplayPopup]);

  const onChangeNetwork = useCallback((newGenesisHash: string) => {
    const availableGenesisHash = newGenesisHash.startsWith('0x') ? newGenesisHash : null;

    address && tieAccount(address, availableGenesisHash).then(() => setGenesis(availableGenesisHash ?? undefined)).catch(console.error);
  }, [address]);

  const onRenameAccount = useCallback(() => {
    address && setDisplayPopup(POPUPS_NUMBER.RENAME);
    handleClose();
  }, [address, handleClose, setDisplayPopup]);

  const onExportAccount = useCallback(() => {
    address && setDisplayPopup(POPUPS_NUMBER.EXPORT_ACCOUNT);
    handleClose();
  }, [address, handleClose, setDisplayPopup]);

  const onManageProxies = useCallback(() => {
    address && chain && onAction(`/manageProxies/${address}`);
  }, [address, chain, onAction]);

  const onManageId = useCallback(() => {
    address && onAction(`/manageIdentity/${address}`);
  }, [address, onAction]);

  const onSocialRecovery = useCallback(() => {
    address && onAction(`/socialRecovery/${address}/false`);
  }, [address, onAction]);

  const Menu = () => (
    <Grid alignItems='flex-start' container display='block' item sx={{ borderRadius: '10px', minWidth: '300px', p: '20px' }}>
      <Grid container item>
        <Chain
          address={address}
          allowAnyChainOption
          defaultValue={genesisHash ?? chain?.genesisHash ?? options[0].text}
          label={t<string>('Chain')}
          onChange={onChangeNetwork}
          style={{ '> div div div div div div': { height: '23px', width: '23px' }, '> div div div#selectChain': { borderRadius: '5px', height: '30px' }, '> div p': { fontSize: '16px', p: 0 }, textAlign: 'left', width: '84%' }}
        />
        <Grid alignContent='flex-end' container item justifyContent='center' width='15%' zIndex={1}>
          {(genesisHash ?? chain?.genesisHash) &&
            <FullScreenRemoteNode
              address={address}
              iconSize={25}
            />}
        </Grid>
      </Grid>
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px' }} />
      <MenuItem
        disabled={!chain || !(PROXY_CHAINS.includes(chain.genesisHash ?? ''))}
        iconComponent={
          <vaadin-icon icon='vaadin:sitemap' style={{ height: '20px', color: `${theme.palette.text.primary}` }} />
        }
        onClick={onManageProxies}
        text={t<string>('Manage proxies')}
      />
      <MenuItem
        disabled={!chain || !(IDENTITY_CHAINS.includes(chain.genesisHash ?? ''))}
        iconComponent={
          <FontAwesomeIcon
            color={(!chain || !(IDENTITY_CHAINS.includes(chain.genesisHash ?? ''))) ? theme.palette.text.disabled : theme.palette.text.primary}
            fontSize={20}
            icon={faAddressCard}
          />
        }
        onClick={onManageId}
        text={t('Manage identity')}
      />
      <MenuItem
        disabled={!chain || !(SOCIAL_RECOVERY_CHAINS.includes(chain.genesisHash ?? ''))}
        iconComponent={
          <SocialRecoveryIcon
            color={
              !chain || !(SOCIAL_RECOVERY_CHAINS.includes(chain.genesisHash ?? ''))
                ? theme.palette.text.disabled
                : theme.palette.text.primary}
            height={24}
            width={24}
          />
        }
        onClick={onSocialRecovery}
        text={t('Social Recovery')}
      />
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px' }} />
      {isExternalAccount &&
        <MenuItem
          iconComponent={
            <vaadin-icon icon='vaadin:download-alt' style={{ height: '20px', color: `${theme.palette.text.primary}` }} />
          }
          onClick={onExportAccount}
          text={t('Export account')}
        />
      }
      {isExternalAccount &&
        <MenuItem
          iconComponent={
            <vaadin-icon icon='vaadin:road-branch' style={{ height: '20px', color: `${theme.palette.text.primary}` }} />
          }
          onClick={goToDeriveAcc}
          text={t('Derive new account')}
        />
      }
      <MenuItem
        iconComponent={
          <vaadin-icon icon='vaadin:edit' style={{ height: '20px', color: `${theme.palette.text.primary}` }} />
        }
        onClick={onRenameAccount}
        text={t('Rename')}
      />
      <MenuItem
        iconComponent={
          <vaadin-icon icon='vaadin:file-remove' style={{ height: '20px', color: `${theme.palette.text.primary}` }} />
        }
        onClick={onForgetAccount}
        text={t('Forget account')}
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
        <Menu />
      </Popover>
    </>
  );
}

export default React.memo(FullScreenAccountMenu);
