// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';

import keyring from '@polkadot/ui-keyring';

import { ActionContext, Address, ButtonWithCancel, Checkbox2 as Checkbox, Password, Warning, WrongPasswordAlert } from '../../components';
import { useTranslation } from '../../hooks';
import { forgetAccount, getAuthList, removeAuthorization, updateAuthorization } from '../../messaging';
import HeaderBrand from '../../partials/HeaderBrand';

function ForgetAccount (): React.ReactElement {
  const { address, isExternal } = useParams<{ address: string; isExternal: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  const [isBusy, setIsBusy] = useState(false);
  const [password, setPassword] = useState<string>('');
  const [checkConfirmed, setCheckConfirmed] = useState<boolean>(false);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const needsPasswordConfirmation = isExternal !== 'true';

  const goHome = useCallback(() => onAction('/'), [onAction]);

  const updateAuthAccountsList = useCallback(async (_address: string) => {
    try {
      const { list } = await getAuthList();

      const updatePromises = Object.entries(list)
        .filter(([, { authorizedAccounts }]) => authorizedAccounts.includes(_address))
        .map(([url, { authorizedAccounts }]) => {
          const newAuthAddressList = authorizedAccounts.filter((authAddress) => authAddress !== _address);

          if (newAuthAddressList.length === 0) {
            return Promise.all([updateAuthorization(newAuthAddressList, url), removeAuthorization(url)]);
          }

          return updateAuthorization(newAuthAddressList, url);
        });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating auth accounts list:', error);
    }
  }, []);

  const onClickForget = useCallback((): void => {
    if (!address) {
      return;
    }

    try {
      setIsBusy(true);

      if (needsPasswordConfirmation) {
        const signer = keyring.getPair(address);

        signer.unlock(password);
      }

      forgetAccount(address)
        .then(async () => {
          await updateAuthAccountsList(address);
          setIsBusy(false);
          onAction('/');
        })
        .catch((error: Error) => {
          setIsBusy(false);
          console.error(error);
        });
    } catch (error) {
      setIsPasswordError(true);
      setIsBusy(false);
      console.error(error);
    }
  }, [address, needsPasswordConfirmation, onAction, password, updateAuthAccountsList]);

  const onChangePass = useCallback((pass: string): void => {
    setPassword(pass);
    setIsPasswordError(false);
  }, []);

  return (
    <>
      <HeaderBrand
        onBackClick={goHome}
        showBackArrow
        text={t('Forget Account')}
      />
      {isPasswordError &&
        <WrongPasswordAlert />
      }
      <Address
        address={address}
      />
      <Grid container>
        <Warning
          iconDanger
          marginTop={0}
          theme={theme}
        >
          {t('Removing this account means losing access via this extension. To recover it later, use the recovery phrase.')}
        </Warning>
      </Grid>
      <Grid m='40px auto 0' width='92%'>
        {needsPasswordConfirmation
          ? <>
            <Password
              isError={isPasswordError}
              isFocused
              label={t('Password for this account')}
              onChange={onChangePass}
              onEnter={onClickForget}
            />
            {isPasswordError && (
              <Warning
                isBelowInput
                isDanger
                theme={theme}
              >
                {t('incorrect password')}
              </Warning>
            )}
          </>
          : (
            <Checkbox
              checked={checkConfirmed}
              iconStyle={{ transform: 'scale:(1.13)' }}
              label={t('I want to forget this account.')}
              labelStyle={{ fontSize: '16px', marginLeft: '7px' }}
              // eslint-disable-next-line react/jsx-no-bind
              onChange={() => setCheckConfirmed(!checkConfirmed)}
              style={{ ml: '5px' }}
            />)
        }
      </Grid>
      <ButtonWithCancel
        _isBusy={isBusy}
        _onClick={onClickForget}
        _onClickCancel={goHome}
        disabled={!checkConfirmed && !password?.length}
        text={t('Forget')}
      />
    </>
  );
}

export default ForgetAccount;
