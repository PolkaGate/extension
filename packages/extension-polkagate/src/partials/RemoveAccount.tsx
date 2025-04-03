// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import { Stack } from '@mui/material';
import { LogoutCurve } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import keyring from '@polkadot/ui-keyring';

import { Address2, DecisionButtons, ExtensionPopup, GlowCheckbox, PasswordInput } from '../components';
import { useSelectedAccount, useTranslation } from '../hooks';
import { forgetAccount } from '../messaging';
import MySnackbar from '../popup/settings/extensionSettings/components/MySnackbar';
import WarningBox from '../popup/settings/partials/WarningBox';
import { ExtensionPopups } from '../util/constants';

interface Props {
  setPopup: React.Dispatch<React.SetStateAction<ExtensionPopups>>;
  open: boolean;
}

function RemoveAccount ({ open, setPopup }: Props): React.ReactElement {
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
    setPopup(ExtensionPopups.NONE);
  }, [setPopup]);

  const onRemove = useCallback(() => {
    try {
      if (!account || (account?.isExternal && !acknowledged) || (!account?.isExternal && !password)) {
        return;
      }

      setIsBusy(true);

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
    <ExtensionPopup
      TitleIcon={LogoutCurve}
      handleClose={handleClose}
      iconSize={24}
      openMenu={open}
      pt={20}
      title={t('Remove Account')}
      withoutTopBorder
    >
      <WarningBox
        description={t('Removing this account means losing access via this extension. To recover it later, use the recovery phrase.')}
        title={t('WARNING')}
      />
      <Stack direction='column' sx={{ position: 'relative', zIndex: 1 }}>
        {account &&
          <Address2
            address={account?.address}
            name={account?.name}
            showAddress
            style={{ mt: '5px', borderRadius: '14px' }}
          />}
        {account && account.isExternal
          ? <GlowCheckbox
            changeState={toggleAcknowledge}
            checked={acknowledged}
            disabled={isBusy}
            label={t('I want to remove this account')}
            style={{ justifyContent: 'center', mb: '80px', mt: '35px' }}
          />
          : <PasswordInput
            focused
            hasError={isPasswordWrong}
            onEnterPress={onRemove}
            onPassChange={onPassChange}
            style={{ marginBottom: '23px', marginTop: '33px' }}
            title={t('Your Password')}
          />
        }
        <DecisionButtons
          direction='vertical'
          disabled={isBusy || (account?.isExternal && !acknowledged) || (!account?.isExternal && !password)}
          onPrimaryClick={onRemove}
          onSecondaryClick={handleClose}
          primaryBtnText={t('Remove')}
          secondaryBtnText={t('Cancel')}
        />
      </Stack>
      <MySnackbar
        onClose={handleClose}
        open={showSnackbar}
        text={t('Account successfully removed!')}
      />
    </ExtensionPopup>
  );
}

export default React.memo(RemoveAccount);
