// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SignerPayloadJSON } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { Proxy } from '../util/types';
import type { DecisionButtonProps } from './DecisionButtons';

import { Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { Data } from 'iconsax-react';
import React, { memo, useCallback, useState } from 'react';
import { BeatLoader } from 'react-spinners';

import { useIsBlueish, useTranslation } from '../hooks';
import { getSignature } from '../messaging';
import StakingActionButton from '../popup/staking/partial/StakingActionButton';
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

  const color = isBlueish ? theme.palette.text.highlight : theme.palette.primary.main;

  if (!proxies) {
    return (
      <Grid container item sx={{ alignItems: 'center', width: 'fit-content' }}>
        <MyTooltip
          content={t('Checking proxy accounts ...')}
          placement='top'
        >
          <Grid container item sx={{ alignItems: 'center', p: '4px', width: 'fit-content' }}>
            <BeatLoader color={color} loading size={5} />
          </Grid>
        </MyTooltip>
      </Grid>
    );
  }

  return (
    <Grid container item onClick={onClick} sx={{ alignItems: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'row', gap: '4px', width: 'fit-content' }}>
      <Data color={color} size='12' />
      <Typography color={color} variant='B-1'>
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
  onCancel: () => void;
  onSignature: ({ signature }: { signature: HexString; }) => Promise<void>;
  onUseProxy: (() => void) | undefined;
  proxies: Proxy[] | undefined;
  style?: React.CSSProperties;
  withCancel: boolean | undefined;
  signerPayload: SignerPayloadJSON | undefined;
}

function SignUsingPassword ({ api, decisionButtonProps, direction = 'vertical', disabled, onCancel, onSignature, onUseProxy, proxies, signerPayload, style, withCancel }: SignUsingPasswordProps) {
  const { t } = useTranslation();
  const isBlueish = useIsBlueish();

  const [hasError, setHasError] = useState<boolean>(false);
  const [isBusy, setBusy] = useState<boolean>(false);

  const onConfirm = useCallback(async () => {
    try {
      if (!signerPayload) {
        return;
      }

      setBusy(true);
      const signature = await getSignature(signerPayload);

      if (!signature) {
        // TODO: show login page
        throw new Error('account is locked need to login again!');
      }

      await onSignature({ signature });
      setBusy(false);
    } catch (e) {
      console.log('error:', e);
      setHasError(true);
      setBusy(false);
    }
  }, [onSignature, signerPayload]);

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
