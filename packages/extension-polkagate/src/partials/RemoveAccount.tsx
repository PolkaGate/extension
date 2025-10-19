// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '../util/handleExtensionPopup';

import { Container, Stack } from '@mui/material';
import { LogoutCurve } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import keyring from '@polkadot/ui-keyring';

import { Address2, DecisionButtons, GlowCheckbox, MySnackbar, PasswordInput } from '../components';
import { useSelectedAccount, useTranslation } from '../hooks';
import { forgetAccount } from '../messaging';
import WarningBox from '../popup/settings/partials/WarningBox';
import { SharePopup } from '.';

interface Props {
  onClose: ExtensionPopupCloser;
  open: boolean;
  onRemoved?: () => void;
}

/**
 * RemoveAccount provides UI to remove an account, handling both external and internal accounts with confirmation and feedback.
 *
 * Has been used in both full-screen & extension mode!
*/
function RemoveAccount ({ onClose, onRemoved, open }: Props): React.ReactElement {
  const { t } = useTranslation();
  const account = useSelectedAccount();

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [acknowledged, setAcknowledge] = useState<boolean>(false);
  const [password, setPassword] = useState<string>();
  const [isPasswordWrong, setPasswordError] = useState<boolean>();
  const [isBusy, setIsBusy] = useState<boolean>();

  const toggleAcknowledge = useCallback((state: boolean) => {
    setAcknowledge(state);
  }, []);

  const handleClose = useCallback(() => {
    setShowSnackbar(false);
    setAcknowledge(false);
    setPassword(undefined);
    setPasswordError(false);
    onClose();
  }, [onClose]);

  const handleCloseSnackbar = useCallback(() => {
    handleClose();
    onRemoved?.();
  }, [handleClose, onRemoved]);

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

          setShowSnackbar(true);
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
  }, [account, acknowledged, password]);

  const onPassChange = useCallback((pass: string | null): void => {
    setPasswordError(false);
    setPassword(pass || '');
  }, []);

  return (
    <SharePopup
      modalStyle={{ minHeight: '200px' }}
      onClose={handleClose}
      open={open}
      popupProps={{ TitleIcon: LogoutCurve, iconSize: 24, pt: 20 }}
      title={t('Remove Account')}
    >
      <Container disableGutters sx={{ height: '440px', position: 'relative', pt: '15px' }}>
        <WarningBox
          description={t('Removing this account means losing access via this extension. To recover it later, use the recovery phrase.')}
          title={t('WARNING')}
        />
        <Stack direction='column' sx={{ zIndex: 1 }}>
          {account &&
            <Address2
              address={account?.address}
              charsCount={14}
              name={account?.name}
              showAddress
              style={{ borderRadius: '14px', filter: showSnackbar ? 'blur(5px)' : 'none', mt: '5px' }}
            />
          }
          {account && account.isExternal
            ? (
              <GlowCheckbox
                changeState={toggleAcknowledge}
                checked={acknowledged}
                disabled={isBusy}
                label={t('I want to remove this account')}
                style={{ justifyContent: 'center', mb: '80px', mt: '35px' }}
              />)
            : (
              <PasswordInput
                focused
                hasError={isPasswordWrong}
                onEnterPress={onRemove}
                onPassChange={onPassChange}
                style={{ filter: showSnackbar ? 'blur(5px)' : 'none', marginTop: '45px' }}
                title={t('Your Password')}
              />)
          }
          <DecisionButtons
            direction='vertical'
            disabled={isBusy || (account?.isExternal && !acknowledged) || (!account?.isExternal && !password)}
            onPrimaryClick={onRemove}
            onSecondaryClick={handleClose}
            primaryBtnText={t('Remove')}
            secondaryBtnText={t('Cancel')}
            style={{ bottom: 0, position: 'absolute' }}
          />
        </Stack>
        <MySnackbar
          onClose={handleCloseSnackbar}
          open={showSnackbar}
          text={t('Account successfully removed!')}
        />
      </Container>
    </SharePopup>
  );
}

export default React.memo(RemoveAccount);
