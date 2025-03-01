// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types/submittable';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { Proxy, TxResult } from '../util/types';

import { Grid, Tooltip } from '@mui/material';
import React, { useCallback, useState } from 'react';

import keyring from '@polkadot/ui-keyring';

import { useInfo, useTranslation } from '../hooks';
import { signAndSend } from '../util/api';
import { Identity, Password, TwoButtons } from '.';

interface Props {
  address: string;
  disabled?: boolean;
  isPasswordError?: boolean;
  onSecondaryClick: () => void;
  primaryBtn?: boolean;
  primaryBtnText?: string;
  prevState?: Record<string, unknown>;
  secondaryBtnText?: string;
  selectedProxy: Proxy | undefined;
  setIsPasswordError: React.Dispatch<React.SetStateAction<boolean>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  steps: Record<string, number>;
  handleTxResult: (txResult: TxResult) => void
  goToSelectProxy: () => void;
  ptx: SubmittableExtrinsic<'promise', ISubmittableResult> | undefined
  senderName: string | undefined;
  selectedProxyName: string | undefined;
  proxies: Proxy[] | undefined;
  from: string | undefined;
  api: ApiPromise | undefined;
}

export default function SignWithPassword({ address, api, disabled, from, goToSelectProxy, handleTxResult, isPasswordError, onSecondaryClick, prevState, primaryBtn, primaryBtnText, proxies, ptx, secondaryBtnText, selectedProxy, selectedProxyName, senderName, setIsPasswordError, setStep, steps }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { chain, formatted } = useInfo(address);

  const [password, setPassword] = useState<string>();

  const _onChange = useCallback(
    (pass: string): void => {
      pass.length > 3 && pass && setPassword(pass);
      pass.length > 3 && pass && setIsPasswordError && setIsPasswordError(false);
    }, [setIsPasswordError]
  );

  const onConfirm = useCallback(async () => {
    try {
      if (!formatted || !api || !ptx || !from) {
        return;
      }

      const signer = keyring.getPair(from);

      signer.unlock(password);
      setStep(steps['WAIT_SCREEN']);

      const txResult = await signAndSend(api, ptx, signer, formatted);

      handleTxResult(txResult);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [api, formatted, from, handleTxResult, password, ptx, setIsPasswordError, setStep, steps]);

  return (
    <>
      <Grid alignItems='center' container item>
        <Grid item xs>
          <Password
            disabled={disabled}
            isError={isPasswordError}
            isFocused={true}
            label={t('Password for {{name}}', { replace: { name: selectedProxyName || senderName || '' } })}
            onChange={_onChange}
            onEnter={onConfirm}
          />
        </Grid>
        {(!!proxies?.length || (prevState as any)?.selectedProxyAddress) &&
          <Tooltip
            arrow
            componentsProps={{
              popper: {
                sx: {
                  '.MuiTooltip-tooltip.MuiTooltip-tooltipPlacementTop.css-18kejt8': {
                    mb: '3px',
                    p: '3px 15px'
                  },
                  '.MuiTooltip-tooltip.MuiTooltip-tooltipPlacementTop.css-1yuxi3g': {
                    mb: '3px',
                    p: '3px 15px'
                  },
                  visibility: selectedProxy ? 'visible' : 'hidden'
                }
              },
              tooltip: {
                sx: {
                  '& .MuiTooltip-arrow': {
                    color: '#fff',
                    height: '10px'
                  },
                  backgroundColor: '#fff',
                  color: '#000',
                  fontWeight: 400
                }
              }
            }}
            leaveDelay={300}
            placement='top-start'
            sx={{ width: 'fit-content' }}
            title={
              <>
                {selectedProxy &&
                  <Identity
                    chain={chain}
                    formatted={selectedProxy?.delegate}
                    identiconSize={30}
                    style={{ fontSize: '14px' }}
                  />
                }
              </>
            }
          >
            <Grid aria-label='useProxy' item onClick={goToSelectProxy} pl='10px' pt='10px' role='button' sx={{ cursor: 'pointer', fontWeight: 400, textDecorationLine: 'underline' }}>
              {selectedProxy ? t('Update proxy') : t('Use proxy')}
            </Grid>
          </Tooltip>
        }
      </Grid>
      <Grid alignItems='center' container id='TwoButtons' item sx={{ '> div': { m: 0, width: '100%' }, pt: '15px' }}>
        <TwoButtons
          disabled={!password || isPasswordError || primaryBtn || disabled}
          mt='8px'
          onPrimaryClick={onConfirm}
          onSecondaryClick={onSecondaryClick}
          primaryBtnText={primaryBtnText ?? t('Confirm')}
          secondaryBtnText={secondaryBtnText ?? t('Back')}
        />
      </Grid>
    </>

  );
}
