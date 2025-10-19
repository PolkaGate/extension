// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/util/handleExtensionPopup';

import { Box, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AccountsStore } from '@polkadot/extension-base/stores';
import { forgetAccount } from '@polkadot/extension-polkagate/src/messaging';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { info } from '../../assets/gif';
import { Address2, DecisionButtons, GlowCheckbox, PasswordInput } from '../../components';
import { useAccount, useAlerts, useTranslation } from '../../hooks';
import { SharePopup } from '../../partials';

interface Props {
  address: string | undefined;
  onClose: ExtensionPopupCloser;
}

/**
 * Component for removing an account from the extension.
 * Handles both external and internal accounts with confirmation and password input.
 *
 * Only has been used in full-screen mode!
 */
function RemoveAccount ({ address, onClose }: Props): React.ReactElement {
  const { t } = useTranslation();
  const account = useAccount(address);
  const navigate = useNavigate();

  const [acknowledged, setAcknowledge] = useState<boolean>(false);
  const [password, setPassword] = useState<string>();
  const [isPasswordWrong, setPasswordError] = useState<boolean>();
  const [isBusy, setIsBusy] = useState<boolean>();

  const { notify } = useAlerts();

  const toggleAcknowledge = useCallback((state: boolean) => {
    setAcknowledge(state);
  }, []);

  const handleClose = useCallback(() => {
    if (window.location.href.includes('accountfs')) { // removing an account from its home
      navigate('/') as void;
    }

    onClose();
  }, [navigate, onClose]);

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  const onRemove = useCallback(async () => {
    try {
      if (!account || (account?.isExternal && !acknowledged) || (!account?.isExternal && !password)) {
        return;
      }

      setIsBusy(true);
      await new Promise(requestAnimationFrame);

      if (!account.isExternal) {
        const signer = keyring.getPair(account.address);

        signer.unlock(password);
      }

      forgetAccount(account.address)
        .then(() => {
          setIsBusy(false);
          notify(t('Account removed successfully.'), 'info');

          handleClose();
        })
        .catch((error: Error) => {
          setIsBusy(false);
          console.error(error);
        });
    } catch (error) {
      setPasswordError(true);
      setIsBusy(false);
      console.error('Error while removing the account:', error);
    }
  }, [account, acknowledged, handleClose, notify, password, t]);

  const onPassChange = useCallback((pass: string | null): void => {
    setPasswordError(false);
    setPassword(pass || '');
  }, []);

  return (
    <SharePopup
      modalProps={{ dividerStyle: { margin: '5px 0 0' }, showBackIconAsClose: true }}
      modalStyle={{ minHeight: '200px' }}
      onClose={handleClose}
      open
      popupProps={{ pt: account?.isExternal ? 95 : 50 }}
      title={t('Confirmation of action')}
    >
      <Grid container item justifyContent='center' sx={{ p: '0 5px 10px', position: 'relative', zIndex: 1 }}>
        <Box
          component='img'
          src={info as string}
          sx={{ height: '100px', width: '100px', zIndex: 2 }}
        />
        <Typography color='#BEAAD8' sx={{ m: '20px 45px 0' }} variant='B-4'>
          {t('Removing this account means losing access via this extension. To recover it later, use the recovery phrase.')}
        </Typography>
        {
          address &&
          <Address2
            address={address}
            charsCount={14}
            showAddress
            showCopy={false}
            style={{ marginTop: '32px' }}
          />
        }
        {account && account.isExternal
          ? (
            <GlowCheckbox
              changeState={toggleAcknowledge}
              checked={acknowledged}
              disabled={isBusy}
              label={t('I want to remove this account')}
              style={{ justifyContent: 'center', my: '35px' }}
            />)
          : (
            <PasswordInput
              focused
              hasError={isPasswordWrong}
              onEnterPress={onRemove}
              onPassChange={onPassChange}
              style={{ marginBottom: '25px', marginTop: '35px' }}
              title={t('Password')}
            />)
        }
        <DecisionButtons
          cancelButton
          direction='vertical'
          disabled={isBusy || (account?.isExternal && !acknowledged) || (!account?.isExternal && !password)}
          isBusy={isBusy}
          onPrimaryClick={onRemove}
          onSecondaryClick={handleClose}
          primaryBtnText={t('Remove account')}
          secondaryBtnText={t('Back')}
        />
      </Grid>
    </SharePopup>
  );
}

export default React.memo(RemoveAccount);
