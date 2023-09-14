// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import keyring from '@polkadot/ui-keyring';

import { ActionContext, Address, ButtonWithCancel, Checkbox2 as Checkbox, Password, Warning, WrongPasswordAlert } from '../../components';
import { useTranslation } from '../../hooks';
import { forgetAccount } from '../../messaging';
import HeaderBrand from '../../partials/HeaderBrand';

// const acceptedFormats = ['application/json', 'text/plain'].join(', ');

interface Props extends RouteComponentProps<{ address: string, isExternal: string }> {
  className?: string;
}

function ForgetAccount({ match: { params: { address, isExternal } } }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const [isBusy, setIsBusy] = useState(false);
  const [password, setPassword] = useState<string>('');
  const [checkConfirmed, setCheckConfirmed] = useState<boolean>(false);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const theme = useTheme();
  const needsPasswordConfirmation = isExternal !== 'true';

  const _goHome = useCallback(
    () => onAction('/'),
    [onAction]
  );

  const _onClickForget = useCallback(
    (): void => {
      try {
        setIsBusy(true);

        if (needsPasswordConfirmation) {
          const signer = keyring.getPair(address);

          signer.unlock(password);
        }

        forgetAccount(address)
          .then(() => {
            setIsBusy(false);
            onAction('/');
          })
          .catch((error: Error) => {
            setIsBusy(false);
            console.error(error);
          });
      } catch (e) {
        setIsPasswordError(true);
        setIsBusy(false);
      }
    },
    [address, needsPasswordConfirmation, onAction, password]
  );

  const _onChangePass = useCallback(
    (pass: string): void => {
      setPassword(pass);
      setIsPasswordError(false);
    }, []
  );

  const _onBackClick = useCallback(() => {
    onAction('/');
  }, [onAction]);

  return (
    <>
      <HeaderBrand
        onBackClick={_onBackClick}
        showBackArrow
        text={t<string>('Forget Account')}
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
          {t('Removing this account means losing access via this extension. To recover it later, use the mnemonic seed.')}
        </Warning>
      </Grid>
      <Grid m='40px auto 0' width='92%'>
        {needsPasswordConfirmation
          ? <>
            <Password
              isError={isPasswordError}
              label={t<string>('Password for this account')}
              onChange={_onChangePass}
              onEnter={_onClickForget}
            />
            {isPasswordError && (
              <Warning
                isBelowInput
                isDanger
                theme={theme}
              >
                {t<string>('incorrect password')}
              </Warning>
            )}
          </>
          : (
            <Checkbox
              checked={checkConfirmed}
              iconStyle={{ transform: 'scale:(1.13)' }}
              label={t<string>('I want to forget this account.')}
              labelStyle={{ fontSize: '16px', marginLeft: '7px' }}
              onChange={() => setCheckConfirmed(!checkConfirmed)}
              style={{ ml: '5px' }}
            />)
        }
      </Grid>
      <ButtonWithCancel
        _isBusy={isBusy}
        _onClick={_onClickForget}
        _onClickCancel={_goHome}
        disabled={!checkConfirmed && !password?.length}
        text={t<string>('Forget')}
      />
    </>
  );
}

export default withRouter(ForgetAccount);
