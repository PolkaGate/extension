// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { JSX } from 'react';
import type { Balance } from '@polkadot/types/interfaces';

import { Grid, Typography } from '@mui/material';
import { Warning2 } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DecisionButtons, PasswordInput } from '../../../components';
import { useCanPayFee } from '../../../hooks/index';
import useTranslation from '../../../hooks/useTranslation';
import { approveSignPassword, isSignLocked } from '../../../messaging';

interface Props {
  address: string;
  error: string | null;
  fee?: Balance | null;
  isSignable: boolean;
  genesisHash?: string;
  setError: (value: string | null) => void;
  signId: string;
  onCancel: () => void;
  style?: React.CSSProperties;
}

export default function SignWithPassword ({ address, error, fee, genesisHash, isSignable, onCancel, setError, signId, style }: Props): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const canPayFee = useCanPayFee(address, genesisHash, fee);

  const [isLocked, setIsLocked] = useState<boolean | null>(null);
  const [password, setPassword] = useState<string | undefined>(undefined);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  useEffect(() => {
    setIsLocked(null);

    isSignLocked(signId)
      .then(({ isLocked }) => {
        setIsLocked(isLocked);
      })
      .catch((error: Error) => console.error(error));
  }, [signId]);

  const onSign = useCallback((): void => {
    setIsBusy(true);

    approveSignPassword(signId, true, password)
      .then((): void => {
        setIsBusy(false);
        navigate('/') as void;
      })
      .catch((error: Error): void => {
        setIsBusy(false);
        setError(error.message);
        console.error(error);
      });
  }, [navigate, password, setError, signId]);

  const onPassChange = useCallback((password: string): void => {
    setPassword(password);
    setError(null);
  }, [setError, setPassword]);

  return isSignable
    ? (
      <>
        {isLocked && (
          <PasswordInput
            focused
            hasError={!!error}
            onEnterPress={onSign}
            onPassChange={onPassChange}
            title={t('Your Password')}
          />
        )}
        {canPayFee === false &&
          <Grid alignItems='center' columnGap='5px' container item sx={{ bottom: !isLocked ? '150px' : '125px', position: 'absolute' }}>
            <Warning2 color='#FFCE4F' size='24px' variant='Bold' />
            <Typography color='#EAEBF1' variant='B-4'>
              {t('Insufficient balance to cover the transaction fee')}
            </Typography>
          </Grid>
        }
        <DecisionButtons
          direction='vertical'
          disabled={(!!isLocked && !password) || !!error}
          isBusy={isBusy}
          onPrimaryClick={onSign}
          onSecondaryClick={onCancel}
          primaryBtnText={t('Approve')}
          secondaryBtnText={t('Cancel')}
          style={{ bottom: '0px', position: 'absolute', ...style }}
        />
      </>
    )
    : <></>;
}
