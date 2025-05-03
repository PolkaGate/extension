// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types/submittable';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { Proxy, TxResult } from '../util/types';

import { Container, Grid, Stack, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { Data } from 'iconsax-react';
import React, { useCallback, useState } from 'react';
import { BeatLoader } from 'react-spinners';

import keyring from '@polkadot/ui-keyring';

import { useTranslation } from '../hooks';
import { TRANSACTION_FLOW_STEPS } from '../partials/TransactionFlow';
import StakingActionButton from '../popup/staking/partial/StakingActionButton';
import { signAndSend } from '../util/api';
import { MyTooltip, PasswordInput } from '.';

interface UseProxyProps {
  proxies: Proxy[] | undefined;
}

const UseProxy = ({ proxies }: UseProxyProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (!proxies || proxies.length) {
    return (
      <Grid container item sx={{ alignItems: 'center', width: 'fit-content' }}>
        <MyTooltip
          content={t('Checking if you have proxy accounts')}
        >
          <BeatLoader color={theme.palette.text.highlight} loading size={5} />
        </MyTooltip>
      </Grid>
    );
  }

  return (
    <Grid container item sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '4px', width: 'fit-content' }}>
      <Data color={theme.palette.text.highlight} size='12' />
      <Typography color='text.highlight' variant='B-1'>
        {t('Use Proxy')}
      </Typography>
    </Grid>
  );
};

interface Props {
  api: ApiPromise | undefined;
  formatted: string | undefined;
  from: string | undefined;
  style?: SxProps<Theme>;
  preparedTransaction: SubmittableExtrinsic<'promise', ISubmittableResult> | undefined;
  handleTxResult: (txResult: TxResult) => void;
  proxies: Proxy[] | undefined;
  setFlowStep: React.Dispatch<React.SetStateAction<TRANSACTION_FLOW_STEPS>>;
}

export default function SignUsingPassword ({ api, formatted, from, handleTxResult, preparedTransaction, proxies, setFlowStep, style }: Props) {
  const { t } = useTranslation();

  const [password, setPassword] = useState<string | undefined>(undefined);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isBusy, setBusy] = useState<boolean>(false);

  const onChangePassword = useCallback((pass: string) => setPassword(pass), []);

  const onConfirm = useCallback(async () => {
    try {
      if (!formatted || !api || !preparedTransaction || !from) {
        return;
      }

      setBusy(true);

      const signer = keyring.getPair(from);

      signer.unlock(password);

      setFlowStep(TRANSACTION_FLOW_STEPS.WAIT_SCREEN);

      const txResult = await signAndSend(api, preparedTransaction, signer, formatted);

      setBusy(false);
      handleTxResult(txResult);
    } catch (e) {
      console.log('error:', e);
      setHasError(true);
      setBusy(false);
    }
  }, [api, formatted, from, handleTxResult, password, preparedTransaction, setFlowStep]);

  return (
    <Stack direction='column' sx={{ bottom: '15px', left: 0, position: 'absolute', px: '15px', right: 0, width: '100%' }}>
      <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', px: '12px' }}>
        <Typography color='text.primary' variant='B-1'>
          {t('Password')}
        </Typography>
        <UseProxy
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
      <StakingActionButton
        disabled={!password || hasError}
        isBusy={isBusy}
        onClick={onConfirm as React.MouseEventHandler<HTMLButtonElement>}
        startIcon
        style={style}
        text={t('Confirm')}
      />
    </Stack>
  );
}
