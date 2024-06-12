// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { canDerive } from '@polkadot/extension-base/utils';
import { openOrFocusTab } from '@polkadot/extension-polkagate/src/fullscreen/accountDetails/components/CommonTasks';
import Bread from '@polkadot/extension-polkagate/src/fullscreen/partials/Bread';
import { Title } from '@polkadot/extension-polkagate/src/fullscreen/sendFund/InputPage';
import { FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';

import { AccountContext, AccountNamePasswordCreation, ActionContext, Label, Password, Warning } from '../../../components';
import { FullScreenHeader } from '../../../fullscreen/governance/FullScreenHeader';
import { useFullscreen, useTranslation } from '../../../hooks';
import { deriveAccount, validateAccount, validateDerivationPath } from '../../../messaging';
import { nextDerivationPath } from '../../../util/nextDerivationPath';
import { AddressState } from '../../../util/types';
import DerivationPath from '../deriveAccount/DerivationPath';
import AddressDropdownFullScreen from './AddressDropdownFullScreen';

// match any single slash
const singleSlashRegex = /([^/]|^)\/([^/]|$)/;

function DeriveFromAccounts(): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);
  const { accounts } = useContext(AccountContext);
  const { address: parentAddress } = useParams<AddressState>();
  const defaultPath = useMemo(() => nextDerivationPath(accounts, parentAddress), [accounts, parentAddress]);
  const [suriPath, setSuriPath] = useState<null | string>(defaultPath);

  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [parentPassword, setParentPassword] = useState<string>('');
  const [isProperParentPassword, setIsProperParentPassword] = useState(false);
  const [pathError, setPathError] = useState('');

  const allowSoftDerivation = useMemo(() => {
    const parent = accounts.find(({ address }) => address === parentAddress);

    return parent?.type === 'sr25519';
  }, [accounts, parentAddress]);

  const allAddresses = useMemo(() => {
    return accounts
      .filter(({ isExternal }) => !isExternal)
      .filter(({ isQR }) => !isQR)
      .filter(({ type }) => canDerive(type))
      .map(({ address, genesisHash, name }): [string, string | null, string | undefined] => [address, genesisHash || null, name]);
  }, [accounts]);

  const { genesisHash: parentGenesis, name: parentName } = useMemo(() => accounts.find((a) => a.address === parentAddress) || { genesisHash: null, name: null }, [accounts, parentAddress]);

  useEffect(() => {
    // forbid the use of password since Keyring ignores it
    if (suriPath?.includes('///')) {
      setPathError(t('`///password` not supported for derivation'));
    }

    if (!allowSoftDerivation && suriPath && singleSlashRegex.test(suriPath)) {
      setPathError(t('Soft derivation is only allowed for sr25519 accounts'));
    }
  }, [allowSoftDerivation, suriPath, t]);

  const onCreate = useCallback(async (name: string, password: string) => {
    let account;
    let validatedParentPassword;

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
      .then(() => openOrFocusTab('/', true))
      .catch((error): void => {
        setIsBusy(false);
        console.error(error);
      });
  }, [parentAddress, parentGenesis, parentPassword, suriPath, t]);

  const onParentChange = useCallback((address: string) => {
    setParentPassword('');
    onAction(`/derivefs/${address}`);
  }, [onAction]);

  const onParentPasswordEnter = useCallback((password: string): void => {
    setParentPassword(password);
    setIsProperParentPassword(!!password);
  }, []);

  useEffect(() => {
    setParentPassword('');
    setIsProperParentPassword(false);
  }, [onParentPasswordEnter]);

  const onSuriPathChange = useCallback((path: string): void => {
    setSuriPath(path);
    setPathError('');
  }, []);

  const onBackClick = useCallback(() => openOrFocusTab('/', true), []);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader
        noAccountDropDown
        noChainSwitch
      />
      <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll', position: 'relative' }}>
        <Grid container item sx={{ display: 'block', mb: '20px', px: '10%' }}>
          <Bread />
          <Title
            height='70px'
            logo={
              <vaadin-icon icon='vaadin:road-branch' style={{ height: '40px', color: `${theme.palette.text.primary}`, width: '40px' }} />
            }
            padding='0px'
            text={t('Derive from accounts')}
          />
          <Typography fontSize='16px' fontWeight={400} width='100%'>
            {t('A derived account inherits the recovery phrase from its parent, but has a unique derivation path. Please select a parent account and enter its password to proceed.')}
          </Typography>
          <Grid container item justifyContent='space-around' sx={{ my: '30px' }}>
            <Label
              label={t('Choose parent account')}
              style={{ margin: 'auto', width: '100%' }}
            >
              <AddressDropdownFullScreen
                allAddresses={allAddresses}
                onSelect={onParentChange}
                selectedAddress={parentAddress}
                selectedGenesis={parentGenesis}
                selectedName={parentName}
              />
            </Label>
          </Grid>
          <Password
            data-input-password
            isError={!!parentPassword && !isProperParentPassword}
            isFocused
            label={t('Password for the account to derive from')}
            onChange={onParentPasswordEnter}
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
            onChange={onSuriPathChange}
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
            onBackClick={onBackClick}
            onCreate={onCreate}
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
