// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { PButton } from '../../components';
import { setStorage } from '../../components/Loading';
import { useExtensionLockContext } from '../../context/ExtensionLockContext';
import { useTranslation } from '../../hooks';
import { STEPS } from './constants';

interface Props {
  setStep: (value: React.SetStateAction<number | undefined>) => void;
}

function AskToSetPassword ({ setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { setExtensionLock } = useExtensionLockContext();

  const onMayBeLater = useCallback(() => {
    setExtensionLock(false);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    setStorage('loginInfo', { lastLogin: Date.now(), status: 'mayBeLater' });
  }, [setExtensionLock]);

  const onNoPassword = useCallback(() => {
    setExtensionLock(false);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    setStorage('loginInfo', { status: 'no' });
  }, [setExtensionLock]);

  const onYesToSetPassword = useCallback(() => {
    setStep(STEPS.SET_PASSWORD);
  }, [setStep]);

  return (
    <Grid container justifyContent='center'>
      <Typography fontSize={16} pb='25px'>
        {t('Would you like to create a password now?')}
      </Typography>
      <PButton
        _ml={0}
        _mt='10px'
        _onClick={onYesToSetPassword}
        text={t('Yes')}
      />
      <PButton
        _ml={0}
        _mt='10px'
        _onClick={onMayBeLater}
        _variant='outlined'
        text={t('Maybe later')}
      />
      <PButton
        _ml={0}
        _mt='10px'
        _onClick={onNoPassword}
        _variant='text'
        text={t('No')}
      />
    </Grid>
  );
}

export default AskToSetPassword;
