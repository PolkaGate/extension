// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import keyring from '@polkadot/ui-keyring';

import { ActionContext, Address, ButtonWithCancel, Checkbox, Password, Warning } from '../../components';
import { useTranslation } from '../../hooks';
import { forgetAccount } from '../../messaging';
import HeaderBrand from '../../partials/HeaderBrand';

const acceptedFormats = ['application/json', 'text/plain'].join(', ');

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
    [address, onAction, password]
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
        text={t<string>('Forget account')}
      />
      {isPasswordError &&
        <Grid
          color='red'
          height='30px'
          m='auto'
          pt='5px'
          width='92%'
        >
          <Warning
            isBelowInput
            isDanger
            theme={theme}
          >
            {t<string>('You’ve used an incorrect password. Try again.')}
          </Warning>
        </Grid>
      }
      <Grid
        container
        direction='column'
        sx={{
          '&::-webkit-scrollbar': {
            display: 'none',
            width: 0
          },
          '> .tree:first-child': {
            borderTopLeftRadius: '5px',
            borderTopRightRadius: '5px'
          },
          '> .tree:last-child': {
            border: 'none',
            borderBottomLeftRadius: '5px',
            borderBottomRightRadius: '5px'
          },
          border: '0.5px solid',
          borderColor: 'secondary.light',
          borderRadius: '5px',
          display: 'block',
          m: '20px auto 0',
          maxHeight: parent.innerHeight * 2 / 3,
          overflowY: 'scroll',
          scrollbarWidth: 'none',
          width: '92%'
        }}
      >
        <Address
          address={address}
          className='tree'
          style={{
            border: 'none',
            borderBottom: '1px solid',
            borderBottomColor: 'secondary.light',
            borderRadius: 'none',
            m: 0,
            width: '100%'
          }}
        />
      </Grid>
      <Grid container letterSpacing='-1.5%' p='23px 24px 0px 14px'>
        <Warning
          isBelowInput
          isDanger
          theme={theme}
        >
          {t('You are about to remove this account. This means you will not be able to access it via this extension anymore. If you want to recover it after, you need to use the Mnemonic seed.')}
        </Warning>
      </Grid>
      <Grid
        item
        m='auto'
        ml='6%'
        mr='15px'
        sx={{
          bottom: '80px',
          position: 'absolute'
        }}
        width='90%'
      >
        {needsPasswordConfirmation
          ? <>
            <Password
              isError={isPasswordError}
              label={t<string>('Password for this account')}
              onChange={_onChangePass}
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
          : <Checkbox
            checked={checkConfirmed}
            label={t<string>('I want to forget this account.')}
            onChange={setCheckConfirmed}
            style={{ fontSize: '16px', marginLeft: '-25px', marginTop: 0, textAlign: 'left' }}
            theme={theme}
          />
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
