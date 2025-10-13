// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SignerOptions, SubmittableExtrinsic } from '@polkadot/api/types/submittable';
import type { GenericExtrinsicPayload } from '@polkadot/types';
import type { ISubmittableResult, SignerPayloadJSON } from '@polkadot/types/types';
import type { Proxy, TxResult } from '../util/types';
import type { DecisionButtonProps } from './DecisionButtons';

import { Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { Data } from 'iconsax-react';
import React, { memo, useCallback, useState } from 'react';
import { BeatLoader } from 'react-spinners';

import { useIsBlueish, useTranslation } from '../hooks';
import { getSignature } from '../messaging';
import StakingActionButton from '../popup/staking/partial/StakingActionButton';
import { submitExtrinsic } from '../util/api';
import { TRANSACTION_FLOW_STEPS, type TransactionFlowStep } from '../util/constants';
import { DecisionButtons, GradientButton, MyTooltip } from '.';

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
  disabled?: boolean;
  decisionButtonProps?: Partial<DecisionButtonProps>
  handleTxResult: (txResult: TxResult) => void;
  onCancel: () => void;
  onUseProxy: (() => void) | undefined;
  preparedTransaction: SubmittableExtrinsic<'promise', ISubmittableResult> | undefined;
  proxies: Proxy[] | undefined;
  setFlowStep: React.Dispatch<React.SetStateAction<TransactionFlowStep>>;
  signerOption: Partial<SignerOptions> | undefined;
  style?: React.CSSProperties;
  withCancel: boolean | undefined;
  signerPayload: SignerPayloadJSON | undefined;
  payload: GenericExtrinsicPayload | undefined;
}

function SignUsingPassword ({ api, decisionButtonProps, direction = 'vertical', disabled, handleTxResult, onCancel, onUseProxy, payload, preparedTransaction, proxies, setFlowStep, signerOption, signerPayload, style, withCancel }: SignUsingPasswordProps) {
  const { t } = useTranslation();
  const isBlueish = useIsBlueish();

  const [hasError, setHasError] = useState<boolean>(false);
  const [isBusy, setBusy] = useState<boolean>(false);

  const onConfirm = useCallback(async () => {
    try {
      if (!api || !preparedTransaction || !signerPayload?.address || !payload) {
        return;
      }

      setBusy(true);
      const signature = await getSignature(signerPayload);

      if (!signature) {
        throw new Error('account is locked need to login again!');
      }

      setFlowStep(TRANSACTION_FLOW_STEPS.WAIT_SCREEN);

      console.log('signerOption:', signerOption);

      // TODO: how use signerOption while using send()
      const txResult = await submitExtrinsic(
        signerPayload.address,
        api,
        preparedTransaction,
        payload.toHex(),
        signature
      );

      setFlowStep(TRANSACTION_FLOW_STEPS.CONFIRMATION);
      setBusy(false);
      handleTxResult(txResult);
    } catch (e) {
      console.log('error:', e);
      setHasError(true);
      setBusy(false);
    }
  }, [api, handleTxResult, payload, preparedTransaction, setFlowStep, signerOption, signerPayload]);

  const confirmText = !api ? t('Loading ...') : t('Approve');

  return (
    <Stack direction='column' sx={{ width: '100%' }}>
      <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', height: '65px', justifyContent: 'end', p: '0 12px 0 5px' }}>
        <UseProxy
          onClick={onUseProxy}
          proxies={proxies}
        />
      </Container>
      {withCancel
        ? (
          <DecisionButtons
            cancelButton
            direction={direction}
            disabled={disabled}
            isBusy={isBusy}
            onPrimaryClick={onConfirm}
            onSecondaryClick={onCancel}
            primaryBtnText={confirmText}
            secondaryBtnText={t('Reject')}
            style={{ width: '100%' }}
            {...decisionButtonProps}
          />)
        : <>
          {isBlueish
            ? (
              <StakingActionButton
                disabled={disabled || hasError}
                isBusy={isBusy}
                onClick={onConfirm as React.MouseEventHandler<HTMLButtonElement>}
                startIcon
                style={style}
                text={confirmText}
              />)
            : (
              <GradientButton
                disabled={disabled || hasError}
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
