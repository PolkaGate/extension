// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '../util/handleExtensionPopup';

import { Box, Grid, Stack, Typography } from '@mui/material';
import { LogoutCurve } from 'iconsax-react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { info } from '../assets/gif';
import { Address2, DecisionButtons, GlowCheckbox, MySnackbar, PasswordInput } from '../components';
import { useAccount, useAlerts, useIsExtensionPopup, useSelectedAccount, useTranslation } from '../hooks';
import { forgetAccount, validateAccount } from '../messaging';
import WarningBox from '../popup/settings/partials/WarningBox';
import { cleanupNotificationAccount } from '../util';
import { SharePopup } from '.';

interface Props {
  onClose: ExtensionPopupCloser;
  open: boolean;
  address?: string | undefined;
}

function TopPageElement ({ isExtension }: { isExtension: boolean }) {
  const { t } = useTranslation();

  const description = t('Removing this account means losing access via this extension. To recover it later, use the recovery phrase.');

  if (isExtension) {
    return (
      <WarningBox
        description={description}
        title={t('WARNING')}
      />
    );
  }

  return (
    <>
      <Box
        component='img'
        src={info as string}
        sx={{ height: '100px', width: '100px', zIndex: 2 }}
      />
      <Typography color='#BEAAD8' sx={{ m: '20px 0 15px' }} variant='B-4'>
        {description}
      </Typography>
    </>
  );
}

/**
 * RemoveAccount provides UI to remove an account, handling both external and internal accounts with confirmation and feedback.
 *
 * Has been used in both full-screen & extension mode!
*/
function RemoveAccount ({ address, onClose, open }: Props): React.ReactElement {
  const { t } = useTranslation();
  const selectedAccount = useSelectedAccount();
  const account = useAccount(address) ?? selectedAccount;
  const navigate = useNavigate();
  const isExtension = useIsExtensionPopup();

  const { notify } = useAlerts();

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [acknowledged, setAcknowledge] = useState<boolean>(false);
  const [password, setPassword] = useState<string>();
  const [isPasswordWrong, setPasswordError] = useState<boolean>();
  const [isBusy, setIsBusy] = useState<boolean>();

  const toggleAcknowledge = useCallback((state: boolean) => {
    setAcknowledge(state);
  }, []);

  const notifier = useCallback((shouldNotify: boolean) => {
    if (isExtension) {
      setShowSnackbar(shouldNotify);

      return;
    }

    shouldNotify && notify(t('Account removed successfully.'), 'info');
  }, [isExtension, notify, t]);

  const handleClose = useCallback(() => {
    setAcknowledge(false);
    setPassword(undefined);
    setPasswordError(false);

    if (window.location.href.includes('accountfs')) { // removing an account from its home
      navigate('/') as void;
    }

    notifier(false);

    onClose();
    isExtension && navigate('/') as void; // in extension mode, go back to home on close
  }, [isExtension, navigate, notifier, onClose]);

  const onRemove = useCallback(async () => {
    try {
      if (!account || (account?.isExternal && !acknowledged) || (!account?.isExternal && !password)) {
        return;
      }

      setIsBusy(true);
      await new Promise(requestAnimationFrame);

      if (!account.isExternal && password) {
        const isUnlockable = await validateAccount(account.address, password);

        if (!isUnlockable) {
          throw new Error('Password incorrect!');
        }
      }

      const success = await forgetAccount(account.address);

      if (success) {
        await cleanupNotificationAccount(account.address);
      }

      notifier(true);
      !isExtension && handleClose(); // in full-screen mode, close the modal on success
    } catch (error) {
      setPasswordError(true);
      setIsBusy(false);
      console.error('Error while removing the account:', error);
    }
  }, [account, acknowledged, handleClose, isExtension, notifier, password]);

  const onPassChange = useCallback((pass: string | null): void => {
    setPasswordError(false);
    setPassword(pass || '');
  }, []);

  return (
    <SharePopup
      modalStyle={{ minHeight: '450px' }}
      onClose={handleClose}
      open={open}
      popupProps={{ TitleIcon: LogoutCurve, iconSize: 24, pt: 20 }}
      title={t('Remove Account')}
    >
      <>
        <Grid container item justifyContent='center' sx={{ p: '0 5px 10px', position: 'relative', zIndex: 1 }}>
          <TopPageElement
            isExtension={isExtension}
          />
          <Stack direction='column' sx={{ width: '100%', zIndex: 1 }}>
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
                  style={{ justifyContent: 'center', my: '30px' }}
                />)
              : (
                <PasswordInput
                  focused
                  hasError={isPasswordWrong}
                  onEnterPress={onRemove}
                  onPassChange={onPassChange}
                  style={{ filter: showSnackbar ? 'blur(5px)' : 'none', marginTop: isExtension ? '45px' : '25px' }}
                  title={t('Your Password')}
                />)
            }
            <DecisionButtons
              direction='vertical'
              disabled={isBusy || (account?.isExternal && !acknowledged) || (!account?.isExternal && !password)}
              isBusy={isBusy}
              onPrimaryClick={onRemove}
              onSecondaryClick={handleClose}
              primaryBtnText={t('Remove')}
              secondaryBtnText={t('Cancel')}
              style={{ marginTop: isExtension ? account?.isExternal ? '60px' : '27px' : '25px' }}
            />
          </Stack>
        </Grid>
        <MySnackbar
          onClose={handleClose}
          open={showSnackbar}
          text={t('Account successfully removed!')}
        />
      </>
    </SharePopup>
  );
}

export default React.memo(RemoveAccount);
