// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { RequestBiometricAuthentication } from '@polkadot/extension-base/utils/biometric';
import type { HexString } from '@polkadot/util/types';

import { Stack, Typography } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { Hashtag } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { validateAccount, validateDerivationPath, validateDerivationPathWithBiometric } from '@polkadot/extension-polkagate/src/messaging';
import { nextDerivationPath } from '@polkadot/extension-polkagate/src/util/nextDerivationPath';

import { DecisionButtons, MyTextField, PasswordInput } from '../../../components';
import { useAccounts, useBiometricAction, useTranslation } from '../../../hooks';
import SelectAccount from './SelectAccount';
import { DERIVATION_STEPS, type PathState } from './types';

// match any single slash
const singleSlashRegex = /([^/]|^)\/([^/]|$)/;

interface Props {
  genesisHash: string | undefined | null;
  isParentBiometricValidated: boolean;
  newParentAddress: string | undefined;
  parentAccount: AccountJson | undefined;
  parentPassword: string | undefined;
  setParentBiometricValidated: React.Dispatch<React.SetStateAction<boolean>>;
  setMaybeChidAccount: React.Dispatch<React.SetStateAction<PathState | undefined>>;
  setNewParentAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  setParentPassword: React.Dispatch<React.SetStateAction<string | undefined>>;
  setStep: React.Dispatch<React.SetStateAction<DERIVATION_STEPS>>;
  onClose: () => void;
}

function ParentInfo({ genesisHash, isParentBiometricValidated, newParentAddress, onClose, parentAccount, parentPassword, setMaybeChidAccount, setNewParentAddress, setParentBiometricValidated, setParentPassword, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const accounts = useAccounts();

  const parentGenesis = (genesisHash ?? POLKADOT_GENESIS) as HexString;

  const [isBusy, setIsBusy] = useState(false);
  const [isProperParentPassword, setIsProperParentPassword] = useState<boolean>();
  const [parentBiometricAuth, setParentBiometricAuth] = useState<RequestBiometricAuthentication>();
  const [suriPath, setSuriPath] = useState<null | string>();
  const [pathError, setPathError] = useState('');
  const { isBiometricAvailable, isBiometricBusy, runBiometricAction } = useBiometricAction();

  const defaultPath = useMemo(() => nextDerivationPath(accounts, newParentAddress), [accounts, newParentAddress]);
  const allowSoftDerivation = useMemo(() => {
    const parent = accounts.find(({ address }) => address === parentAccount?.address);

    return parent?.type === 'sr25519';
  }, [accounts, parentAccount?.address]);

  useEffect(() => {
    setSuriPath(defaultPath);
  }, [defaultPath]);

  useEffect(() => {
    setIsProperParentPassword(undefined); // reset password error on maybeChidAccount change
    setMaybeChidAccount(undefined);
    setParentBiometricAuth(undefined);
    setParentBiometricValidated(false);
    setParentPassword(undefined);
    setPathError('');
  }, [newParentAddress, setMaybeChidAccount, setParentBiometricValidated, setParentPassword]);

  useEffect(() => {
    // forbid the use of password since Keyring ignores it
    if (suriPath?.includes('///')) {
      setPathError(t('/// not supported for derivation'));
    }

    if (!allowSoftDerivation && suriPath && singleSlashRegex.test(suriPath)) {
      setPathError(t('Soft derivation is only allowed for sr25519 accounts'));
    }
  }, [allowSoftDerivation, suriPath, t]);

  const onNext = useCallback(async() => {
    const parentAddress = parentAccount?.address;

    if (!suriPath || !parentAddress) {
      return;
    }

    setIsBusy(true);

    if (isParentBiometricValidated && parentBiometricAuth) {
      try {
        const _account = await validateDerivationPathWithBiometric(parentAddress, suriPath, parentBiometricAuth);

        if (!_account) {
          setIsProperParentPassword(false);

          return;
        }

        setMaybeChidAccount(_account);
        setParentBiometricAuth(undefined);
        setStep(DERIVATION_STEPS.CHILD);
      } catch (error) {
        setPathError(t('Invalid derivation path'));
        console.error(error);
      } finally {
        setIsBusy(false);
      }

      return;
    }

    if (!parentPassword) {
      setIsBusy(false);

      return;
    }

    const isUnlockable = await validateAccount(parentAddress, parentPassword);

    if (isUnlockable) {
      try {
        const _account = await validateDerivationPath(parentAddress, suriPath, parentPassword);

        setMaybeChidAccount(_account);
        setParentBiometricValidated(false);
        setStep(DERIVATION_STEPS.CHILD);
        setIsBusy(false);
      } catch (error) {
        setIsBusy(false);
        setPathError(t('Invalid derivation path'));
        console.error(error);
      }
    } else {
      setIsBusy(false);
      setIsProperParentPassword(false);
    }
  }, [isParentBiometricValidated, parentAccount?.address, parentBiometricAuth, parentPassword, setMaybeChidAccount, setParentBiometricValidated, setStep, suriPath, t]);

  const onParentPasswordEnter = useCallback((password: string): void => {
    setMaybeChidAccount(undefined);
    setParentBiometricAuth(undefined);
    setParentBiometricValidated(false);
    setParentPassword(password);
    setIsProperParentPassword(!!password);
  }, [setMaybeChidAccount, setParentBiometricValidated, setParentPassword]);

  const onSuriPathChange = useCallback((path: string): void => {
    setMaybeChidAccount(undefined);
    setSuriPath(path);
    setPathError('');
  }, [setMaybeChidAccount]);

  const onBiometricNext = useCallback(async(): Promise<void> => {
    setIsBusy(true);

    try {
      const auth = await runBiometricAction((auth) => Promise.resolve(auth));

      if (!auth) {
        setIsProperParentPassword(false);

        return;
      }

      setMaybeChidAccount(undefined);
      setParentBiometricAuth(auth);
      setParentPassword(undefined);
      setParentBiometricValidated(true);
      setIsProperParentPassword(true);
    } catch (error) {
      setIsProperParentPassword(false);
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  }, [runBiometricAction, setMaybeChidAccount, setParentBiometricValidated, setParentPassword]);

  return (
    <Stack columnGap='15px' direction='column' sx={{ m: '10px 15px 0', position: 'relative', px: '5px', zIndex: 1 }}>
      <Typography color='#BEAAD8' sx={{ lineHeight: '16.8px', mx: '15px' }} textAlign='center' variant='B-4'>
        {t('Derived accounts share the same recovery phrase as their parent but follow a different path to remain distinct.')}
      </Typography>
      {parentAccount &&
        <SelectAccount
          genesisHash={parentGenesis}
          selectedAccount={parentAccount.address}
          setSelectedAccount={setNewParentAddress}
          style={{ marginTop: '20px', padding: '19px 10px' }}
        />
      }
      <PasswordInput
        biometricDisabled={isBusy || isBiometricBusy}
        focused
        hasError={isProperParentPassword === false}
        isBiometricBusy={isBiometricBusy}
        isBiometricVerified={isParentBiometricValidated && Boolean(parentBiometricAuth)}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onBiometricClick={isBiometricAvailable ? onBiometricNext : undefined}
        onPassChange={onParentPasswordEnter}
        style={{ marginTop: '30px' }}
        title={t('Password')}
      />
      <MyTextField
        Icon={Hashtag}
        errorMessage={pathError}
        iconSize={18}
        inputValue={suriPath}
        onTextChange={onSuriPathChange}
        placeholder={defaultPath}
        style={{ margin: '25px 0 0' }}
        title={t('Derivation path')}
      />
      <DecisionButtons
        cancelButton
        direction='vertical'
        disabled={!suriPath || (!parentPassword && !(isParentBiometricValidated && parentBiometricAuth))}
        isBusy={isBusy}
        onPrimaryClick={onNext}
        onSecondaryClick={onClose}
        primaryBtnText={t('Next')}
        secondaryBtnText={t('Cancel')}
        style={{ marginTop: '25px', width: '100%' }}
      />
    </Stack>
  );
}

export default React.memo(ParentInfo);
