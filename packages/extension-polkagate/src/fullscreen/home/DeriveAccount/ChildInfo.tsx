// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/util/handleExtensionPopup';
import type { HexString } from '@polkadot/util/types';

import { Grid, Stack, Typography } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { User } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { deriveAccount } from '@polkadot/extension-polkagate/src/messaging';

import { DecisionButtons, Identity2, MatchPasswordField, MySnackbar, MyTextField } from '../../../components';
import { useTranslation } from '../../../hooks';
import { DERIVATION_STEPS } from './types';

interface AddressState {
  address: string;
}

interface PathState extends AddressState {
  suri: string;
}

interface Props {
  genesisHash: string | undefined | null;
  maybeChidAccount: PathState | undefined;
  parentAddress?: string;
  parentPassword: string | undefined;
  setMaybeChidAccount: React.Dispatch<React.SetStateAction<PathState | undefined>>;
  onClose: ExtensionPopupCloser;
  setStep: React.Dispatch<React.SetStateAction<DERIVATION_STEPS>>;
}

function ChildInfo ({ genesisHash, maybeChidAccount, onClose, parentAddress, parentPassword, setMaybeChidAccount, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();

  const parentGenesis = (genesisHash ?? POLKADOT_GENESIS) as HexString;

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [error, setError] = useState<string>();
  const [isBusy, setIsBusy] = useState(false);
  const [childName, setChildName] = useState<string | null>(null);
  const [password, setPassword] = useState<string>();

  const onCreate = useCallback(() => {
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
    onClose();
  }, [onClose]);

  return (
    <Grid container item justifyContent='center' sx={{ position: 'relative', px: '5px', zIndex: 1 }}>
      <Stack columnGap='15px' direction='column' sx={{ mx: '15px', width: '94%' }}>
        <Typography color='#BEAAD8' sx={{ lineHeight: '16.8px', mx: '15px' }} textAlign='center' variant='B-4'>
          {t('This account is derived from the selected parent account. It will have its own name and password.')}
        </Typography>
        <Identity2
          address={maybeChidAccount?.address}
          addressStyle={{ color: 'primary.main', variant: 'B-1' }}
          charsCount={14}
          genesisHash={parentGenesis}
          identiconSize={30}
          identiconStyle={{ marginRight: '5px' }}
          name={childName ?? t('Unknown')}
          style={{ backgroundColor: 'background.default', borderRadius: '14px', marginTop: '20px', padding: '15px 10px', variant: 'B-2', width: '100%' }}
          withShortAddress
        />
        <MyTextField
          Icon={User}
          focused
          iconSize={18}
          inputValue={childName}
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

export default React.memo(ChildInfo);
