// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Close as CloseIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { WrongPasswordAlert } from '../../../components';
import { getStorage, LoginInfo } from '../../../components/Loading';
import { useTranslation } from '../../../hooks';
import Confirmation from '../../../popup/passwordManagement/Confirmation';
import { STEPS } from '../../../popup/passwordManagement/constants';
import Modify from '../../../popup/passwordManagement/Modify';
import SetPassword from '../../../popup/passwordManagement/SetPassword';
import { DraggableModal } from '../../governance/components/DraggableModal';

interface Props {
  open: boolean;
  setDisplayPopup: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ManageLoginPassword ({ open, setDisplayPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

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
        <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
          <Grid alignItems='flex-start' container justifyContent='flex-start' sx={{ width: 'fit-content' }}>
            <Grid item>
              <vaadin-icon icon='vaadin:key' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
            </Grid>
            <Grid item sx={{ pl: '10px' }}>
              <Typography fontSize='22px' fontWeight={700}>
                {t('Manage Login Password')}
              </Typography>
            </Grid>
          </Grid>
          <Grid item>
            <CloseIcon onClick={backToAccount} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
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
