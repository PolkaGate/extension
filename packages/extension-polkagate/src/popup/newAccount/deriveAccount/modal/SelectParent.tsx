// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { canDerive } from '@polkadot/extension-base/utils';

import { AccountContext, ButtonWithCancel, ChainLogo, Label, NewAddress, Password, Warning } from '../../../../components';
import useTranslation from '../../../../hooks/useTranslation';
import { validateAccount, validateDerivationPath } from '../../../../messaging';
import { nextDerivationPath } from '../../../../util/nextDerivationPath';
import AddressDropdown from './AddressDropdown';
import DerivationPath from './DerivationPath';

interface Props {
  onDerivationConfirmed: (derivation: { account: { address: string; suri: string }; parentPassword: string }) => void;
  parentAccount: AccountJson | undefined;
  setSelectedParentAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedParentAddress: string | undefined;
  isLocked: boolean;
  onClose: () => void;
}

// match any single slash
const singleSlashRegex = /([^/]|^)\/([^/]|$)/;

export default function SelectParent ({ isLocked, onClose, onDerivationConfirmed, parentAccount, selectedParentAddress, setSelectedParentAddress }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [isBusy, setIsBusy] = useState(false);
  const { accounts, hierarchy } = useContext(AccountContext);
  const theme = useTheme();

  const defaultPath = useMemo(() => {
    if (!parentAccount?.address) {
      return undefined;
    } else {
      return nextDerivationPath(accounts, parentAccount.address);
    }
  }, [accounts, parentAccount]);

  const [suriPath, setSuriPath] = useState<string | null | undefined>(defaultPath);
  const [parentPassword, setParentPassword] = useState<string>('');
  const [isProperParentPassword, setIsProperParentPassword] = useState(false);
  const [pathError, setPathError] = useState('');
  const passwordInputRef = useRef<HTMLDivElement>(null);
  const allowSoftDerivation = useMemo(() => parentAccount?.type === 'sr25519', [parentAccount?.type]);

  // reset the password field if the parent address changes
  useEffect(() => {
    setParentPassword('');
  }, [parentAccount, parentAccount?.address, selectedParentAddress]);

  useEffect(() => {
    // forbid the use of password since Keyring ignores it
    if (suriPath?.includes('///')) {
      setPathError(t('`///password` not supported for derivation'));
    }

    if (!allowSoftDerivation && suriPath && singleSlashRegex.test(suriPath)) {
      setPathError(t('Soft derivation is only allowed for sr25519 accounts'));
    }
  }, [allowSoftDerivation, suriPath, t]);

  const allAddresses = useMemo(() => (
    hierarchy
      .filter(({ isExternal }) => !isExternal)
      .filter(({ type }) => canDerive(type))
      .map(({ address, genesisHash, name }): [string, string | null, string | undefined] => [address, genesisHash || null, name])
  ), [hierarchy]);

  const onParentPasswordChange = useCallback((parentPassword: string): void => {
    setParentPassword(parentPassword);
    setIsProperParentPassword(!!parentPassword);
  }, []);

  const _onSuriPathChange = useCallback((path: string): void => {
    setSuriPath(path);
    setPathError('');
  }, []);

  const onParentChange = useCallback((selectedParentAddress: string) => setSelectedParentAddress(selectedParentAddress), [setSelectedParentAddress]);

  const _onSubmit = useCallback(async (): Promise<void> => {
    const _path = suriPath || defaultPath;

    if (_path && parentAccount?.address && parentPassword) {
      setIsBusy(true);

      const isUnlockable = await validateAccount(parentAccount.address, parentPassword);

      if (isUnlockable) {
        try {
          const account = await validateDerivationPath(parentAccount.address, _path, parentPassword);

          onDerivationConfirmed({ account, parentPassword });
        } catch (error) {
          setIsBusy(false);
          setPathError(t('Invalid derivation path'));
          console.error(error);
        }
      } else {
        setIsBusy(false);
        setIsProperParentPassword(false);
      }
    }
  }, [suriPath, parentAccount?.address, parentPassword, defaultPath, onDerivationConfirmed, t]);

  useEffect(() => {
    setParentPassword('');
    setIsProperParentPassword(false);

    passwordInputRef.current?.querySelector('input')?.focus();
  }, []);

  return (
    <>
      <>
        {isLocked
          ? (
            <Grid alignItems='center' container item sx={{ bgcolor: 'background.paper', border: theme.palette.mode === 'dark' ? '1px solid' : 'none', borderColor: 'secondary.light', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', mb: '20px', px: '10px' }}>
              <Grid container item xs>
                <NewAddress
                  address={parentAccount?.address}
                  name={parentAccount?.name}
                  showCopy={false}
                  style={{ border: 'none', boxShadow: 'none', px: 0 }}
                />
              </Grid>
              <Grid container item width='fit-content'>
                <ChainLogo genesisHash={parentAccount?.genesisHash ?? ''} />
              </Grid>
            </Grid>
          )
          : (
            <Label
              label={t('Choose parent account')}
              style={{ margin: 'auto', paddingBottom: '20px', width: '92%' }}
            >
              <AddressDropdown
                allAddresses={allAddresses}
                onSelect={onParentChange}
                selectedAddress={parentAccount?.address ?? ''}
                selectedGenesis={parentAccount?.genesisHash as string}
                selectedName={parentAccount?.name as string | null}
              />
            </Label>
          )
        }
        <Grid container item ref={passwordInputRef}>
          <Password
            data-input-password
            isError={!!parentPassword && !isProperParentPassword}
            isFocused
            label={t('Password for the account to derive from')}
            onChange={onParentPasswordChange}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onEnter={_onSubmit}
            style={{ marginBottom: '15px', width: '100%' }}
            value={parentPassword}
          />
          {!!parentPassword && !isProperParentPassword && (
            <Grid color='red' height='30px' m='auto' mt='-10px' width='100%'>
              <Warning
                fontWeight={400}
                isBelowInput
                isDanger
                theme={theme}
              >
                {t('You’ve used an incorrect password. Try again.')}
              </Warning>
            </Grid>
          )}
          <DerivationPath
            defaultPath={defaultPath}
            isError={!!pathError}
            onChange={_onSuriPathChange}
            withSoftPath={allowSoftDerivation}
          />
          {(!!pathError) && (
            <Grid color='red' height='30px' m='auto' mt={0} width='100%'>
              <Warning
                fontWeight={400}
                isBelowInput
                isDanger
                theme={theme}
              >
                {t(pathError)}
              </Warning>
            </Grid>
          )}
        </Grid>
      </>
      <Grid container item sx={{ '> div': { ml: 'auto', width: '87.5%' }, bottom: 0, height: '36px', position: 'absolute' }}>
        <ButtonWithCancel
          _isBusy={isBusy}
          _onClick={_onSubmit}
          _onClickCancel={onClose}
          disabled={!isProperParentPassword || !!pathError || !parentAccount?.address}
          text={t('Next')}
        />
      </Grid>
    </>
  );
}
