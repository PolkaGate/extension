// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { faAddressCard } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, Popover, useTheme } from '@mui/material';
import React, { useCallback, useContext,useState } from 'react';

import { ActionContext, MenuItem, RemoteNodeSelector2, SelectChain, SocialRecoveryIcon } from '../../../components';
import { useAccount, useChain, useGenesisHashOptions, useTranslation } from '../../../hooks';
import { tieAccount } from '../../../messaging';
import { IDENTITY_CHAINS, SOCIAL_RECOVERY_CHAINS } from '../../../util/constants';
import getLogo from '../../../util/getLogo';

interface Props {
  address: string | undefined;
  baseButton: React.ReactNode;
}

function FullScreenAccountMenu({ address, baseButton }: Props): React.ReactElement<Props> {
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

  const canDerive = !(account?.isExternal || account?.isHardware);

  const _onForgetAccount = useCallback(() => {
    address && onAction(`/forget/${address}/${account.isExternal}`);
  }, [address, account, onAction]);

  const _goToDeriveAcc = useCallback(() => {
    address && onAction(`/derive/${address}/locked`);
  }, [address, onAction]);

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
    address && onAction(`/manageIdentity/${address}`);
  }, [address, onAction]);

  const _onSocialRecovery = useCallback(() => {
    address && onAction(`/socialRecovery/${address}/false`);
  }, [address, onAction]);

  const Menu = () => (
    <Grid alignItems='flex-start' container display='block' item sx={{ borderRadius: '10px', minWidth: '300px', p: '20px' }}>
      <MenuItem
        disabled={!chain}
        iconComponent={
          <vaadin-icon icon='vaadin:sitemap' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
        }
        onClick={_onManageProxies}
        text={t<string>('Manage proxies')}
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
      <MenuItem
        disabled={!chain || !(SOCIAL_RECOVERY_CHAINS.includes(chain.genesisHash ?? ''))}
        iconComponent={
          <SocialRecoveryIcon
            color={
              !chain || !(SOCIAL_RECOVERY_CHAINS.includes(chain.genesisHash ?? ''))
                ? theme.palette.text.disabled
                : theme.palette.text.primary}
            height={22}
            width={22}
          />
        }
        onClick={_onSocialRecovery}
        text={t('Social Recovery')}
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
      <RemoteNodeSelector2
        address={address}
        genesisHash={genesisHash}
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
