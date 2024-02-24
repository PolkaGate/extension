// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { canDerive } from '@polkadot/extension-base/utils';

import { AccountContext, AccountNamePasswordCreation, ActionContext, Label, Password, PButton, Warning } from '../../../components';
import { useFullscreen, useTranslation } from '../../../hooks';
import { deriveAccount, validateAccount, validateDerivationPath } from '../../../messaging';
import { nextDerivationPath } from '../../../util/nextDerivationPath';
import { AddressState } from '../../../util/types';
import AddressDropdown from '../deriveAccount/AddressDropdown';
import DerivationPath from '../deriveAccount/DerivationPath';
import { FullScreenHeader } from '../../governance/FullScreenHeader';

// match any single slash
const singleSlashRegex = /([^/]|^)\/([^/]|$)/;

function DeriveFromAccounts(): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);
  const { accounts, hierarchy } = useContext(AccountContext);
  const { address: parentAddress } = useParams<AddressState>();
  const defaultPath = useMemo(() => nextDerivationPath(accounts, parentAddress), [accounts, parentAddress]);
  const [suriPath, setSuriPath] = useState<null | string>(defaultPath);
  const [name, setName] = useState<string | null>(null);

  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [parentPassword, setParentPassword] = useState<string>('');
  const [isProperParentPassword, setIsProperParentPassword] = useState(false);
  const [pathError, setPathError] = useState('');

  const indexBgColor = useMemo(() => theme.palette.mode === 'light' ? '#DFDFDF' : theme.palette.background.paper, [theme.palette]);
  const contentBgColor = useMemo(() => theme.palette.mode === 'light' ? '#F1F1F1' : theme.palette.background.default, [theme.palette]);

  const allowSoftDerivation = useMemo(() => {
    const parent = accounts.find(({ address }) => address === parentAddress);

    return parent?.type === 'sr25519';
  }, [accounts, parentAddress]);

  const allAddresses = useMemo(
    () => hierarchy
      .filter(({ isExternal }) => !isExternal)
      .filter(({ type }) => canDerive(type))
      .map(({ address, genesisHash, name }): [string, string | null, string | undefined] => [address, genesisHash || null, name]),
    [hierarchy]
  );

  const { genesisHash: parentGenesis, name: parentName } = useMemo(
    () =>
      accounts.find((a) => a.address === parentAddress) || { genesisHash: null, name: null }
    ,
    [accounts, parentAddress]
  );

  // reset the password field if the parent address changes
  useEffect(() => {
    setParentPassword('');
  }, [parentAddress]);

  useEffect(() => {
    // forbid the use of password since Keyring ignores it
    if (suriPath?.includes('///')) {
      setPathError(t('`///password` not supported for derivation'));
    }

    if (!allowSoftDerivation && suriPath && singleSlashRegex.test(suriPath)) {
      setPathError(t('Soft derivation is only allowed for sr25519 accounts'));
    }
  }, [allowSoftDerivation, suriPath, t]);

  const _onCreate = useCallback(async (name: string, password: string) => {
    let account;
    let validatedParentPassword;

    console.log('nameL', name);
    console.log('password', password);
    console.log('parentPassword', parentPassword);

    if (suriPath && parentAddress && parentPassword) {
      setIsBusy(true);

      const isUnlockable = await validateAccount(parentAddress, parentPassword);

      if (isUnlockable) {
        try {
          account = await validateDerivationPath(parentAddress, suriPath, parentPassword);

          validatedParentPassword = parentPassword;
        } catch (error) {
          setIsBusy(false);
          setPathError(t('Invalid derivation path'));
          console.error(error);
        }
      } else {
        setIsBusy(false);
        setIsProperParentPassword(false);

        return;
      }
    }

    if (!account || !name || !password || !validatedParentPassword) {
      return;
    }

    setIsBusy(true);
    deriveAccount(parentAddress, account.suri, validatedParentPassword, name, password, parentGenesis)
      .then(() => onAction('/'))
      .catch((error): void => {
        setIsBusy(false);
        console.error(error);
      });
  }, [onAction, parentAddress, parentGenesis, parentPassword, suriPath, t]);

  const _onParentChange = useCallback(
    (address: string) =>
      onAction(`/fullscreenDerive/${address}`)
    ,
    [onAction]
  );

  const _onParentPasswordEnter = useCallback(
    (password: string): void => {
      setParentPassword(password);
      setIsProperParentPassword(!!password);
    },
    []
  );

  useEffect(() => {
    setParentPassword('');
    setIsProperParentPassword(false);
  }, [_onParentPasswordEnter]);

  const _onSuriPathChange = useCallback(
    (path: string): void => {
      setSuriPath(path);
      setPathError('');
    },
    []
  );

  const _onBackClick = useCallback(() => {
    onAction('/');
  }, [onAction]);

  // TODO: FixMe
  const onPassword = useCallback(() => {

  }, []);

  return (
    <Grid bgcolor={indexBgColor} container item justifyContent='center'>
      <FullScreenHeader
        noAccountDropDown
        noChainSwitch
      />
      <Grid container item justifyContent='center' sx={{ bgcolor: contentBgColor, height: 'calc(100vh - 70px)', maxWidth: '840px', overflow: 'scroll' }}>
        <Grid container item sx={{ display: 'block', px: '10%' }}>
          <Grid alignContent='center' alignItems='center' container item>
            <Grid item sx={{ mr: '20px' }}>
              <vaadin-icon icon='vaadin:road-branch' style={{ height: '40px', color: `${theme.palette.text.primary}`, width: '40px' }} />
            </Grid>
            <Grid item>
              <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
                {t<string>('Derive from accounts')}
              </Typography>
            </Grid>
          </Grid>
          <Typography fontSize='16px' fontWeight={400} width='100%'>
            {t<string>('A derived account inherits the recovery phrase from its parent, but has a unique derivation path. Please select a parent account and enter its password to proceed.')}
          </Typography>
          <Label
            label={t<string>('Choose parent account')}
            style={{ margin: 'auto', paddingBottom: '30px', paddingTop: '30px', width: '100%' }}
          >
            <AddressDropdown
              allAddresses={allAddresses}
              onSelect={_onParentChange}
              selectedAddress={parentAddress}
              selectedGenesis={parentGenesis}
              selectedName={parentName}
            />
          </Label>
          <Password
            data-input-password
            isError={!!parentPassword && !isProperParentPassword}
            isFocused
            label={t<string>('Password for the account to derive from')}
            onChange={_onParentPasswordEnter}
            onOffFocus={onPassword}
            value={parentPassword}
          />
          {!!parentPassword && !isProperParentPassword && (
            <Warning
              isBelowInput
              isDanger
              theme={theme}
            >
              {t('Wrong password')}
            </Warning>
          )}
          <DerivationPath
            defaultPath={defaultPath}
            isError={!!pathError}
            onChange={_onSuriPathChange}
            parentAddress={parentAddress}
            parentPassword={parentPassword}
            withSoftPath={allowSoftDerivation}
          />
          {(!!pathError) && (
            <Warning
              isBelowInput
              isDanger
              theme={theme}
            >
              {pathError}
            </Warning>
          )}
          <AccountNamePasswordCreation
            buttonLabel={t('Create')}
            isBusy={isBusy}
            isFocused={false}
            mt='30px'
            nameLabel={t('Choose a name for the derived account')}
            onBackClick={_onBackClick}
            onCreate={_onCreate}
            onNameChange={setName}
            passwordLabel={t('Create a password for the derived account (>5 characters)')}
            style={{ width: '100%' }}
            withCancel
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default React.memo(DeriveFromAccounts);
