// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { LoginInfo } from '../../../components/Loading';

import { Grid } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { WrongPasswordAlert } from '../../../components';
import { getStorage } from '../../../components/Loading';
import { useTranslation } from '../../../hooks';
import Confirmation from '../../../popup/passwordManagement/Confirmation';
import { STEPS } from '../../../popup/passwordManagement/constants';
import Modify from '../../../popup/passwordManagement/Modify';
import SetPassword from '../../../popup/passwordManagement/SetPassword';
import { DraggableModal } from '../../governance/components/DraggableModal';
import SimpleModalTitle from '../../partials/SimpleModalTitle';

interface Props {
  open: boolean;
  setDisplayPopup: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ManageLoginPassword({ open, setDisplayPopup }: Props): React.ReactElement {
  const { t } = useTranslation();

  const [step, setStep] = useState<number>();
  const [newPassword, setNewPassword] = useState<string>('');
  const [isPasswordError, setIsPasswordError] = useState(false);

  useEffect(() => {
    getStorage('loginInfo').then((info) => {
      setStep((info as LoginInfo).status === 'set' ? STEPS.ALREADY_SET_PASSWORD : STEPS.NO_PASSWORD);
    }).catch(console.error);
  }, []);

  const onPassChange = useCallback((pass: string | null): void => {
    setIsPasswordError(false);
    setNewPassword(pass || '');
  }, []);

  const onBackClick = useCallback(() => {
    setDisplayPopup(false);
    getStorage('loginInfo').then((info) => {
      setStep((info as LoginInfo).status === 'set' ? STEPS.ALREADY_SET_PASSWORD : STEPS.NO_PASSWORD);
    }).catch(console.error);
  }, [setDisplayPopup]);

  const backToAccount = useCallback(() => setDisplayPopup(false), [setDisplayPopup]);

  return (
    <DraggableModal onClose={backToAccount} open={open}>
      <>
        <SimpleModalTitle
          icon='vaadin:key'
          onClose={backToAccount}
          title={t('Manage Login Password')}
        />
        {isPasswordError &&
          <Grid alignItems='center' container sx={{ height: '120px', top: '30px' }}>
            <WrongPasswordAlert />
          </Grid>
        }
        {step === STEPS.NO_PASSWORD &&
          <SetPassword
            isPasswordError={isPasswordError}
            newPassword={newPassword}
            onBackClick={onBackClick}
            onPassChange={onPassChange}
            setStep={setStep}
          />
        }
        {step === STEPS.ALREADY_SET_PASSWORD &&
          <Modify
            isPasswordError={isPasswordError}
            newPassword={newPassword}
            onBackClick={onBackClick}
            onPassChange={onPassChange}
            setIsPasswordError={setIsPasswordError}
            setStep={setStep}
          />
        }
        {step !== undefined && [STEPS.NEW_PASSWORD_SET, STEPS.PASSWORD_REMOVED].includes(step) &&
          <Confirmation
            onBackClick={onBackClick}
            step={step}
          />
        }
      </>
    </DraggableModal>
  );
}
