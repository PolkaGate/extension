// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useState } from 'react';

import useAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import { ExtensionPopups } from '@polkadot/extension-polkagate/src/util/constants';

import { useAccount, useSelectedAccount, useTranslation } from '../../../hooks';
import { DraggableModal } from '../../components/DraggableModal';
import ChildInfo from './ChildInfo';
import ParentInfo from './ParentInfo';
import StepsRow from './StepsRow';
import { DERIVATION_STEPS, type PathState } from './types';

interface Props {
  setPopup: React.Dispatch<React.SetStateAction<ExtensionPopups>>;
  open: ExtensionPopups | undefined;
}

function DeriveAccount({ open, setPopup }: Props): React.ReactElement {
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
      setPopup(ExtensionPopups.NONE);
    }
  }, [setPopup, step]);

  return (
    <DraggableModal
      noDivider
      onClose={onClose}
      open={open !== undefined}
      showBackIconAsClose={step === DERIVATION_STEPS.CHILD}
      style={{ minHeight: '200px' }}
      title={t('Derive Account')}
    >
      <>
        <StepsRow
          inputStep={step}
        />
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
      </>
    </DraggableModal>
  );
}

export default React.memo(DeriveAccount);
