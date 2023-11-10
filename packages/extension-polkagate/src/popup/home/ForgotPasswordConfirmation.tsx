// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { Checkbox2, PButton, Popup, Warning } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { HeaderBrand } from '../../partials';

interface Props {
  onRejectForgotPassword: () => Promise<void>
  onConfirmForgotPassword: () => Promise<void>
}

export default function ForgotPasswordConfirmation({ onConfirmForgotPassword, onRejectForgotPassword }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const [show, setShow] = useState<boolean>(true);
  const [isChecked, setChecked] = useState<boolean>(false);

  const onClose = useCallback(() => {
    setShow(false);
    onRejectForgotPassword().catch(console.error);
  }, [onRejectForgotPassword]);

  const onCheckChange = useCallback(() => {
    setChecked(!isChecked);
  }, [isChecked]);

  const _onConfirmForgotPassword = useCallback(() => {
    onConfirmForgotPassword().catch(console.error);
    setShow(false);
  }, [onConfirmForgotPassword]);

  return (
    <Popup show={show}>
      <HeaderBrand
        backgroundDefault
        noBorder
        onClose={onClose}
        showBrand
        showClose
        showCloseX
        text={'Polkagate'}
      />
      <Grid container direction='column' px='15px'>
        <Grid container item justifyContent='center' pb='20px' pt='50px'>
          <Typography fontSize='18px' fontWeight={500}>
            {t<string>('Are you sure you want to proceed?')}
          </Typography>
        </Grid>
        <Grid container item sx={{ backgroundColor: 'background.paper', border: 1, borderColor: 'secondary.light', borderRadius: '5px', py: '25px' }}>
          <Warning
            fontWeight={500}
            iconDanger
            isDanger
            marginRight={5}
            marginTop={0}
            paddingLeft={5}
            theme={theme}
          >
            {t<string>('This action will permanently delete your account(s), and you won\'t be able to recover your password. You will need to start fresh by creating a new account or importing from a backup (JSON file or recovery phrase).')}
          </Warning>
        </Grid>
        <Checkbox2
          checked={isChecked}
          label={t<string>('I acknowledge permanent account(s) deletion.')}
          labelStyle={{ fontSize: '14px' }}
          onChange={onCheckChange}
          style={{ bottom: 75, position: 'absolute' }}
        />
      </Grid>
      <PButton
        _onClick={_onConfirmForgotPassword}
        disabled={!isChecked}
        text={t<string>('Confirm')}
      />
    </Popup>
  );
}
