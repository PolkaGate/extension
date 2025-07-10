// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { HexString } from '@polkadot/util/types';

import { Box, Grid, Stack, Typography } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { Hashtag, User } from 'iconsax-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import useAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import { deriveAccount, validateAccount, validateDerivationPath } from '@polkadot/extension-polkagate/src/messaging';
import { nextDerivationPath } from '@polkadot/extension-polkagate/src/util/nextDerivationPath';

import { exportAccountsGif } from '../../assets/gif';
import { AccountContext, DecisionButtons, Identity2, MatchPasswordField, MySnackbar, MyTextField, PasswordInput } from '../../components';
import { useAccount, useSelectedAccount, useTranslation } from '../../hooks';
import { DraggableModal } from '../components/DraggableModal';
import SelectAccount from './SelectAccount';

interface Props {
  setPopup: React.Dispatch<React.SetStateAction<any | undefined>>;
  open: any | undefined;
}

interface AddressState {
  address: string;
}

interface PathState extends AddressState {
  suri: string;
}

// match any single slash
const singleSlashRegex = /([^/]|^)\/([^/]|$)/;

enum DERIVATION_STEPS {
  PARENT,
  CHILD
}

interface ChildInfoProps {
  genesisHash: string | undefined | null;
  maybeChidAccount: PathState | undefined;
  parentAddress?: string;
  parentPassword: string | undefined;
  setMaybeChidAccount: React.Dispatch<React.SetStateAction<PathState | undefined>>;
  setPopup: React.Dispatch<any>;
  setStep: React.Dispatch<React.SetStateAction<DERIVATION_STEPS>>;
}

function ChildInfo ({ genesisHash, maybeChidAccount, parentAddress, parentPassword, setMaybeChidAccount, setPopup, setStep }: ChildInfoProps): React.ReactElement {
  const { t } = useTranslation();

  const parentGenesis = (genesisHash ?? POLKADOT_GENESIS) as HexString;

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [error, setError] = useState<string>();
  const [isBusy, setIsBusy] = useState(false);
  const [childName, setChildName] = useState<string | null>(null);
  const [password, setPassword] = useState<string>();

  const onCreate = useCallback(async () => {
    if (!maybeChidAccount || !childName || !password || !parentAddress || !parentPassword) {
      return;
    }

    setIsBusy(true);
    deriveAccount(parentAddress, maybeChidAccount.suri, parentPassword, childName, password, parentGenesis)
      .then(() => {
        setShowSnackbar(true);
        setIsBusy(false);
      })
      .catch((error: Error): void => {
        setIsBusy(false);
        setError(error.message);
      });
  }, [childName, maybeChidAccount, parentAddress, parentGenesis, parentPassword, password]);

  const onNameChange = useCallback((enteredName: string) => {
    // Remove leading white spaces
    const trimmedName = enteredName.replace(/^\s+/, '');

    // Remove multiple consecutive spaces in the middle or at the end
    const cleanedName = trimmedName.replace(/\s{2,}/g, ' ');

    setChildName(cleanedName);
  }, []);

  const onBackClick = useCallback(() => {
    setMaybeChidAccount(undefined);
    setStep(DERIVATION_STEPS.PARENT);
  }, [setMaybeChidAccount, setStep]);

  const onSnackbarClose = useCallback(() => {
    setShowSnackbar(false);
    setPopup(undefined);
  }, [setPopup]);

  return (
    <Grid container item justifyContent='center' sx={{ position: 'relative', px: '5px', zIndex: 1 }}>
      <Stack columnGap='15px' direction='column' sx={{ m: '10px 15px 0', width: '94%' }}>
        <Box component='img' src={exportAccountsGif as string} sx={{ alignSelf: 'center', width: '100px' }} />
        <Typography color='#BEAAD8' sx={{ lineHeight: '16.8px', m: '5px 15px' }} textAlign='center' variant='B-4'>
          {t('Each derived account is based on its parent’s recovery phrase but has its own identity.')}
        </Typography>
        <Identity2
          address={maybeChidAccount?.address}
          addressStyle={{ color: 'primary.main' }}
          charsCount={14}
          genesisHash={parentGenesis}
          identiconSize={30}
          identiconStyle={{ marginRight: '5px' }}
          name={childName ?? t('Unknown')}
          style={{ addressVariant: 'B-1', bgcolor: 'background.default', borderRadius: '14px', marginTop: '20px', padding: '15px 10px', variant: 'B-2', width: '100%' }}
          withShortAddress
        />
        <MyTextField
          Icon={User}
          focused
          iconSize={18}
          onTextChange={onNameChange}
          placeholder={t('New name')}
          style={{ margin: '25px 0 0' }}
          title={t('Name your derived account')}
        />
        <MatchPasswordField
          setConfirmedPassword={setPassword}
          style={{ marginTop: '20px' }}
          title1={childName
            ? t('Set a password for {{name}}', { name: childName })
            : t('Set a password')}
        />
        <DecisionButtons
          cancelButton
          direction='vertical'
          disabled={!childName || !password}
          isBusy={isBusy}
          onPrimaryClick={onCreate}
          onSecondaryClick={onBackClick}
          primaryBtnText={t('Apply')}
          secondaryBtnText={t('Back')}
          style={{ marginTop: '25px', width: '100%' }}
        />
      </Stack>
      <MySnackbar
        isError={!!error}
        onClose={onSnackbarClose}
        open={showSnackbar}
        text={error ?? t('New account derived successfully!')}
      />
    </Grid>
  );
}

interface ParentInfoProps {
  genesisHash: string | undefined | null;
  newParentAddress: string | undefined;
  parentAccount: AccountJson | undefined;
  parentPassword: string | undefined;
  setMaybeChidAccount: React.Dispatch<React.SetStateAction<PathState | undefined>>;
  setNewParentAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  setParentPassword: React.Dispatch<React.SetStateAction<string | undefined>>;
  setStep: React.Dispatch<React.SetStateAction<DERIVATION_STEPS>>;
  onClose: () => void;
}

function ParentInfo ({ genesisHash, newParentAddress, onClose, parentAccount, parentPassword, setMaybeChidAccount, setNewParentAddress, setParentPassword, setStep }: ParentInfoProps): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);

  const parentGenesis = (genesisHash ?? POLKADOT_GENESIS) as HexString;

  const [isBusy, setIsBusy] = useState(false);
  const [isProperParentPassword, setIsProperParentPassword] = useState<boolean>();
  const [suriPath, setSuriPath] = useState<null | string>();
  const [pathError, setPathError] = useState('');

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
  }, [newParentAddress]);

  useEffect(() => {
    // forbid the use of password since Keyring ignores it
    if (suriPath?.includes('///')) {
      setPathError(t('/// not supported for derivation'));
    }

    if (!allowSoftDerivation && suriPath && singleSlashRegex.test(suriPath)) {
      setPathError(t('Soft derivation is only allowed for sr25519 accounts'));
    }
  }, [allowSoftDerivation, suriPath, t]);

  const onNext = useCallback(async () => {
    const parentAddress = parentAccount?.address;

    if (suriPath && parentAddress && parentPassword) {
      setIsBusy(true);

      const isUnlockable = await validateAccount(parentAddress, parentPassword);

      if (isUnlockable) {
        try {
          const _account = await validateDerivationPath(parentAddress, suriPath, parentPassword);

          setMaybeChidAccount(_account);
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
    }
  }, [parentAccount?.address, parentPassword, setMaybeChidAccount, setStep, suriPath, t]);

  const onParentPasswordEnter = useCallback((password: string): void => {
    setParentPassword(password);
    setIsProperParentPassword(!!password);
  }, [setParentPassword]);

  const onSuriPathChange = useCallback((path: string): void => {
    setSuriPath(path);
    setPathError('');
  }, []);

  return (
    <Stack columnGap='15px' direction='column' sx={{ m: '10px 15px 0', position: 'relative', px: '5px', zIndex: 1 }}>
      <Box component='img' src={exportAccountsGif as string} sx={{ alignSelf: 'center', width: '100px' }} />
      <Typography color='#BEAAD8' sx={{ lineHeight: '16.8px', m: '5px 15px' }} textAlign='center' variant='B-4'>
        {t('Derived accounts use the same seed as their parent, but follow a different derivation path.')}
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
        focused
        hasError={isProperParentPassword === false}
        onPassChange={onParentPasswordEnter}
        style={{ marginTop: '30px' }}
        title={t('Password of {{parentName}}', { replace: { parentName: parentAccount?.name } })}
      />
      <MyTextField
        Icon={Hashtag}
        errorMessage={pathError}
        iconSize={18}
        onTextChange={onSuriPathChange}
        placeholder={defaultPath}
        style={{ margin: '25px 0 0' }}
        title={t('Derivation path')}
      />
      <DecisionButtons
        cancelButton
        direction='vertical'
        disabled={!parentPassword || !suriPath}
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

function DeriveAccount ({ open, setPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const selectedAccount = useSelectedAccount();
  const selectedGenesis = useAccountSelectedChain(selectedAccount?.address);

  const [maybeChidAccount, setMaybeChidAccount] = useState<PathState>();
  const [parentPassword, setParentPassword] = useState<string>();
  const [step, setStep] = useState(DERIVATION_STEPS.PARENT);
  const [newParentAddress, setNewParentAddress] = useState<string | undefined>();

  const parentAccount = useAccount(newParentAddress ?? selectedAccount?.address);

  useEffect(() => {
    setNewParentAddress(selectedAccount?.address);
  }, [selectedAccount?.address, setNewParentAddress]);

  const onClose = useCallback(() => {
    if (step === DERIVATION_STEPS.CHILD) {
      setStep(DERIVATION_STEPS.PARENT);
    } else {
      setPopup(undefined);
    }
  }, [setPopup, step]);

  return (
    <DraggableModal
      dividerStyle={{ margin: '5px 0 0' }}
      onClose={onClose}
      open={open !== undefined}
      showBackIconAsClose={step === DERIVATION_STEPS.CHILD}
      style={{ minHeight: '200px' }}
      title={t('Derive Account')}
    >
      {step === DERIVATION_STEPS.PARENT
        ? <ParentInfo
          genesisHash={selectedGenesis}
          newParentAddress={newParentAddress}
          onClose={onClose}
          parentAccount={parentAccount}
          parentPassword={parentPassword}
          setMaybeChidAccount={setMaybeChidAccount}
          setNewParentAddress={setNewParentAddress}
          setParentPassword={setParentPassword}
          setStep={setStep}
        />
        : <ChildInfo
          genesisHash={selectedGenesis}
          maybeChidAccount={maybeChidAccount}
          parentAddress={parentAccount?.address}
          parentPassword={parentPassword}
          setMaybeChidAccount={setMaybeChidAccount}
          setPopup={setPopup}
          setStep={setStep}
        />
      }
    </DraggableModal>
  );
}

export default React.memo(DeriveAccount);
