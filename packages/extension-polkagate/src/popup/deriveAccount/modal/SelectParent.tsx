// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { AccountJson } from '@polkadot/extension-base/background/types';
import { canDerive } from '@polkadot/extension-base/utils';

import { AccountContext, Address, ButtonWithCancel, ChainLogo, Label, Password, Warning } from '../../../components';
import useTranslation from '../../../hooks/useTranslation';
import { validateAccount, validateDerivationPath } from '../../../messaging';
import { nextDerivationPath } from '../../../util/nextDerivationPath';
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

export default function SelectParent({ isLocked, onClose, onDerivationConfirmed, parentAccount, selectedParentAddress, setSelectedParentAddress }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [isBusy, setIsBusy] = useState(false);
  const { accounts, hierarchy } = useContext(AccountContext);
  const theme = useTheme();

  const defaultPath = useMemo(() => {
    if (!parentAccount || !parentAccount.address) {
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
    if ((suriPath || defaultPath) && parentAccount?.address && parentPassword) {
      setIsBusy(true);

      const isUnlockable = await validateAccount(parentAccount.address, parentPassword);

      if (isUnlockable) {
        try {
          const account = await validateDerivationPath(parentAccount.address, suriPath ?? defaultPath ?? '', parentPassword);

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
            <Grid alignItems='center' container item justifyContent='space-around' sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', m: 'auto', mb: '20px' }}>
              <Grid container item xs={11}>
                <Address
                  address={parentAccount?.address}
                  genesisHash={parentAccount?.genesisHash}
                  showCopy={false}
                  style={{ '> div:last-child': { alignItems: 'flex-start' }, border: 'none', borderRadius: '5px 0 0 5px', m: 0, px: '10px', width: '100%' }}
                />
              </Grid>
              <Grid container item xs={1}>
                <ChainLogo genesisHash={parentAccount?.genesisHash} />
              </Grid>
            </Grid>
          )
          : (
            <Label
              label={t<string>('Choose parent account')}
              style={{ margin: 'auto', paddingBottom: '20px', width: '92%' }}
            >
              <AddressDropdown
                allAddresses={allAddresses}
                onSelect={onParentChange}
                selectedAddress={parentAccount?.address}
                selectedGenesis={parentAccount?.genesisHash}
                selectedName={parentAccount?.name}
              />
            </Label>
          )
        }
        <Grid container item ref={passwordInputRef}>
          <Password
            data-input-password
            isError={!!parentPassword && !isProperParentPassword}
            isFocused
            label={t<string>('Password for the account to derive from')}
            onChange={onParentPasswordChange}
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
                {t<string>('You’ve used an incorrect password. Try again.')}
              </Warning>
            </Grid>
          )}
          <DerivationPath
            defaultPath={defaultPath}
            isError={!!pathError}
            onChange={_onSuriPathChange}
            parentAddress={parentAccount?.address}
            parentPassword={parentPassword}
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
                {t<string>(pathError)}
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
          text={t<string>('Next')}
        />
      </Grid>
    </>
  );
}
