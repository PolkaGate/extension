// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types/submittable';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { Proxy, TxResult } from '../util/types';

import { Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { Data } from 'iconsax-react';
import React, { useCallback, useState } from 'react';
import { BeatLoader } from 'react-spinners';

import keyring from '@polkadot/ui-keyring';

import { useIsBlueish, useTranslation } from '../hooks';
import StakingActionButton from '../popup/staking/partial/StakingActionButton';
import { signAndSend } from '../util/api';
import { TRANSACTION_FLOW_STEPS, type TransactionFlowStep } from '../util/constants';
import { DecisionButtons, GradientButton, MyTooltip, PasswordInput } from '.';

interface UseProxyProps {
  proxies: Proxy[] | undefined;
  onClick: (() => void) | undefined;
}

const UseProxy = ({ onClick, proxies }: UseProxyProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if ((proxies && proxies.length === 0) || !onClick) {
    return null;
  }

  if (!proxies) {
    return (
      <Grid container item sx={{ alignItems: 'center', width: 'fit-content' }}>
        <MyTooltip
          content={t('Checking if you have proxy accounts')}
          placement='top'
        >
          <Grid container item sx={{ alignItems: 'center', p: '4px', width: 'fit-content' }}>
            <BeatLoader color={theme.palette.text.highlight} loading size={5} />
          </Grid>
        </MyTooltip>
      </Grid>
    );
  }

  return (
    <Grid container item onClick={onClick} sx={{ alignItems: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'row', gap: '4px', width: 'fit-content' }}>
      <Data color={theme.palette.text.highlight} size='12' />
      <Typography color='text.highlight' variant='B-1'>
        {t('Use Proxy')}
      </Typography>
    </Grid>
  );
};

interface Props {
  api: ApiPromise | undefined;
  from: string | undefined;
  handleTxResult: (txResult: TxResult) => void;
  onCancel: () => void;
  onUseProxy: (() => void) | undefined;
  preparedTransaction: SubmittableExtrinsic<'promise', ISubmittableResult> | undefined;
  proxies: Proxy[] | undefined;
  setFlowStep: React.Dispatch<React.SetStateAction<TransactionFlowStep>>;
  style?: React.CSSProperties;
  withCancel: boolean | undefined
}

export default function SignUsingPassword ({ api, from, handleTxResult, onCancel, onUseProxy, preparedTransaction, proxies, setFlowStep, style, withCancel }: Props) {
  const { t } = useTranslation();
  const isBlueish = useIsBlueish();

  const [password, setPassword] = useState<string | undefined>(undefined);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isBusy, setBusy] = useState<boolean>(false);

  const onChangePassword = useCallback((pass: string) => {
    setPassword(pass);
    setHasError(false);
  }, []);

  const onConfirm = useCallback(async () => {
    try {
      if (!api || !preparedTransaction || !from) {
        return;
      }

      setBusy(true);

      const signer = keyring.getPair(from);

      signer.unlock(password);

      setFlowStep(TRANSACTION_FLOW_STEPS.WAIT_SCREEN);

      const txResult = await signAndSend(api, preparedTransaction, signer, from);

      setFlowStep(TRANSACTION_FLOW_STEPS.CONFIRMATION);
      setBusy(false);
      handleTxResult(txResult);
    } catch (e) {
      console.log('error:', e);
      setHasError(true);
      setBusy(false);
    }
  }, [api, from, handleTxResult, password, preparedTransaction, setFlowStep]);

  return (
    <Stack direction='column' sx={{ bottom: '15px', left: 0, position: 'absolute', px: '15px', right: 0, width: '100%' }}>
      <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '0 12px 0 5px' }}>
        <Typography color='text.primary' variant='B-1'>
          {t('Password')}
        </Typography>
        <UseProxy
          onClick={onUseProxy}
          proxies={proxies}
        />
      </Container>
      <PasswordInput
        focused
        hasError={hasError}
        onEnterPress={onConfirm}
        onPassChange={onChangePassword}
        style={{ margin: '6px 0 30px' }}
      />
      {withCancel
        ? <DecisionButtons
          cancelButton
          direction='vertical'
          isBusy={isBusy}
          onPrimaryClick={onConfirm}
          onSecondaryClick={onCancel}
          primaryBtnText={t('Confirm')}
          secondaryBtnText={t('Cancel')}
          style={{ width: '100%' }}
        />
        : <>
          {isBlueish
            ? <StakingActionButton
              disabled={!password || hasError}
              isBusy={isBusy}
              onClick={onConfirm as React.MouseEventHandler<HTMLButtonElement>}
              startIcon
              style={style}
              text={t('Confirm')}
            />
            : <GradientButton
              disabled={!password || hasError}
              isBusy={isBusy}
              onClick={onConfirm as React.MouseEventHandler<HTMLButtonElement>}
              style={style}
              text={t('Confirm')}
            />
          }
        </>
      }
    </Stack>
  );
}
