// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { HexString } from '@polkadot/util/types';

import { Stack, Typography } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { Hashtag } from 'iconsax-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { validateAccount, validateDerivationPath } from '@polkadot/extension-polkagate/src/messaging';
import { nextDerivationPath } from '@polkadot/extension-polkagate/src/util/nextDerivationPath';

import { AccountContext, DecisionButtons, MyTextField, PasswordInput } from '../../../components';
import { useTranslation } from '../../../hooks';
import SelectAccount from '../SelectAccount';
import { DERIVATION_STEPS, type PathState } from './types';

// match any single slash
const singleSlashRegex = /([^/]|^)\/([^/]|$)/;

interface Props {
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

function ParentInfo ({ genesisHash, newParentAddress, onClose, parentAccount, parentPassword, setMaybeChidAccount, setNewParentAddress, setParentPassword, setStep }: Props): React.ReactElement {
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
        focused
        hasError={isProperParentPassword === false}
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

export default React.memo(ParentInfo);
