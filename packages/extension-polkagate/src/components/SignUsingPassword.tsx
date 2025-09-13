// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SignerOptions, SubmittableExtrinsic } from '@polkadot/api/types/submittable';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { Proxy, TxResult } from '../util/types';
import type { DecisionButtonProps } from './DecisionButtons';

import { Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { Data } from 'iconsax-react';
import React, { memo, useCallback, useState } from 'react';
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
  const { t } = useTranslation();
  const theme = useTheme();
  const isBlueish = useIsBlueish();

  if ((proxies && proxies.length === 0) || !onClick) {
    return null;
  }

  if (!proxies) {
    return (
      <Grid container item sx={{ alignItems: 'center', width: 'fit-content' }}>
        <MyTooltip
          content={t('Checking proxy accounts ...')}
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
      <Data color={isBlueish ? theme.palette.text.highlight : theme.palette.primary.main} size='12' />
      <Typography color={isBlueish ? 'text.highlight' : 'primary.main'} variant='B-1'>
        {t('Use Proxy')}
      </Typography>
    </Grid>
  );
};

export interface SignUsingPasswordProps {
  api: ApiPromise | undefined;
  direction?: 'horizontal' | 'vertical';
  decisionButtonProps?: Partial<DecisionButtonProps>
  from: string | undefined;
  handleTxResult: (txResult: TxResult) => void;
  onCancel: () => void;
  onUseProxy: (() => void) | undefined;
  preparedTransaction: SubmittableExtrinsic<'promise', ISubmittableResult> | undefined;
  proxies: Proxy[] | undefined;
  setFlowStep: React.Dispatch<React.SetStateAction<TransactionFlowStep>>;
  signerOption: Partial<SignerOptions> | undefined;
  style?: React.CSSProperties;
  withCancel: boolean | undefined
}

function SignUsingPassword ({ api, decisionButtonProps, direction = 'vertical', from, handleTxResult, onCancel, onUseProxy, preparedTransaction, proxies, setFlowStep, signerOption, style, withCancel }: SignUsingPasswordProps) {
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

      const txResult = await signAndSend(api, preparedTransaction, signer, from, signerOption);

      setFlowStep(TRANSACTION_FLOW_STEPS.CONFIRMATION);
      setBusy(false);
      handleTxResult(txResult);
    } catch (e) {
      console.log('error:', e);
      setHasError(true);
      setBusy(false);
    }
  }, [api, from, handleTxResult, password, preparedTransaction, setFlowStep, signerOption]);

  const confirmText = !api ? t('Loading ...') : t('Confirm');

  return (
    <Stack direction='column' sx={{ width: '100%' }}>
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
        ? (
          <DecisionButtons
            cancelButton
            direction={direction}
            isBusy={isBusy}
            onPrimaryClick={onConfirm}
            onSecondaryClick={onCancel}
            primaryBtnText={confirmText}
            secondaryBtnText={t('Cancel')}
            style={{ width: '100%' }}
            {...decisionButtonProps}
          />)
        : <>
          {isBlueish
            ? (
              <StakingActionButton
                disabled={!password || hasError}
                isBusy={isBusy}
                onClick={onConfirm as React.MouseEventHandler<HTMLButtonElement>}
                startIcon
                style={style}
                text={confirmText}
              />)
            : (
              <GradientButton
                disabled={!password || hasError}
                isBusy={isBusy}
                onClick={onConfirm as React.MouseEventHandler<HTMLButtonElement>}
                style={style}
                text={confirmText}
              />)
          }
        </>
      }
    </Stack>
  );
}

export default memo(SignUsingPassword);
