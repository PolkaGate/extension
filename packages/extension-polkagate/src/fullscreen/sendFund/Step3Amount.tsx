// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Teleport } from '@polkadot/extension-polkagate/src/hooks/useTeleport';
import type { Inputs } from './types';

import { Box, Stack, Typography, useTheme } from '@mui/material';
import { getExistentialDeposit, type TChain } from '@paraspell/sdk-pjs';
import { Warning2 } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getValue } from '@polkadot/extension-polkagate/src/popup/account/util';
import { amountToHuman, amountToMachine } from '@polkadot/extension-polkagate/src/util';
import resolveLogoInfo from '@polkadot/extension-polkagate/src/util/logo/resolveLogoInfo';
import { BN, noop } from '@polkadot/util';

import { ActionButton, DisplayBalance, Logo, Motion, MyTextField } from '../../components';
import { useAccountAssets, useChainInfo, useTranslation } from '../../hooks';
import NumberedTitle from './partials/NumberedTitle';
import useWarningMessage from './useWarningMessage';
import { getCurrency, normalizeChainName } from './utils';

interface Props {
  inputs: Inputs | undefined;
  isContract: boolean | undefined;
  teleportState: Teleport;
  setInputs: React.Dispatch<React.SetStateAction<Inputs | undefined>>;
}

export default function Step3Amount({ inputs, isContract, setInputs }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { address, assetId, genesisHash } = useParams<{ address: string, genesisHash: string, assetId: string }>();
  const accountAssets = useAccountAssets(address);
  const { chainName: senderChainName } = useChainInfo(genesisHash, true);
  const decimal = inputs?.decimal;

  const [error, setError] = useState<string | undefined>();
  const [amount, setAmount] = useState<string | undefined>(inputs?.amount);
  const assetToTransfer = useMemo(() => accountAssets?.find((asset) => asset.genesisHash === genesisHash && String(asset.assetId) === assetId), [accountAssets, assetId, genesisHash]);
  const transferableBalance = useMemo(() => getValue('transferable', assetToTransfer), [assetToTransfer]);
  const logoInfo = useMemo(() => resolveLogoInfo(genesisHash, assetToTransfer?.token), [assetToTransfer?.token, genesisHash]);
  const amountAsBN = useMemo(() => decimal ? amountToMachine(amount, decimal) : undefined, [amount, decimal]);

  const warningMessage = useWarningMessage(assetId, amountAsBN, assetToTransfer, decimal, inputs?.transferType ?? 'Normal', new BN(inputs?.fee?.originFee?.fee || 0));
  const amountShortcutButtonStyle = useMemo(() => ({
    '&:hover': {
      backgroundColor: isDark ? undefined : '#E9DDFB',
      borderColor: isDark ? undefined : '#D3C3EE'
    },
    backgroundColor: isDark ? undefined : '#F3F6FD',
    border: isDark ? undefined : '1px solid #DDE3F4',
    borderRadius: '999px',
    color: isDark ? undefined : '#745E9F',
    height: '26px',
    minWidth: 'fit-content',
    padding: '0 14px',
    width: 'fit-content'
  }), [isDark]);

  useEffect(() => {
    amountAsBN && setInputs((pre) => ({
      ...(pre || {}),
      amountAsBN
    }));
  }, [amountAsBN, setInputs]);

  const onMaxClick = useCallback(() => {
    if (!transferableBalance || !assetToTransfer) {
      return setError(t('We’re updating your balance — please wait a moment and try again.'));
    }

    const allAmount = amountToHuman(transferableBalance.toString(), decimal);

    setError(undefined);

    setAmount(allAmount);
    setInputs((prevInputs) => ({
      ...(prevInputs || {}),
      amount: allAmount,
      error: undefined,
      transferType: 'All'
    }));
  }, [assetToTransfer, decimal, setInputs, t, transferableBalance]);

  const onAmountChange = useCallback((value: string) => {
    if (!assetToTransfer || !decimal) {
      return;
    }

    setError(undefined);
    const toTransferAmount = amountToMachine(value, decimal);

    if (transferableBalance && toTransferAmount?.gt(transferableBalance)) {
      return setError(t('Amount will exceed transferable balance!'));
    }

    setError(undefined);
    setAmount(value);
    setInputs((prevInputs) => ({
      ...(prevInputs || {}),
      amount: value,
      error: undefined,
      transferType: 'Normal'
    }));
  }, [assetToTransfer, decimal, setInputs, t, transferableBalance]);

  const ED = useMemo(() => {
    const DEFAULT_ED = '0.01';
    let maybeED = DEFAULT_ED;

    try {
      const { assetId, token } = inputs || {};

      if (senderChainName && assetId !== undefined && token && !isContract) {
        const currency = getCurrency(senderChainName, token, assetId);
        const _senderChainName = normalizeChainName(senderChainName);
        const mayBeEDasBN = getExistentialDeposit(_senderChainName as TChain, currency);

        if (mayBeEDasBN && decimal !== undefined) {
          const EDinHuman = amountToHuman(mayBeEDasBN, decimal);

          maybeED = EDinHuman === '0' ? DEFAULT_ED : EDinHuman;
        }
      }

      return maybeED;
    } catch (error) {
      console.log('Something went wrong while getting ED', error);

      return maybeED;
    }
  }, [decimal, inputs, isContract, senderChainName]);

  const onMinClick = useCallback(() => {
    setError(undefined);
    setAmount(ED);
    setInputs((prevInputs) => ({
      ...(prevInputs || {}),
      amount: ED,
      error: undefined,
      transferType: 'Normal'
    }));
  }, [ED, setInputs]);

  return (
    <Motion variant='slide'>
      <Typography color='text.secondary' sx={{ mt: '15px', textAlign: 'left', width: '100%' }} variant='B-4'>
        {t('Input transfer amount')}
      </Typography>
      <Stack direction='column' justifyContent='space-between' sx={{ bgcolor: isDark ? '#05091C' : '#FFFFFF', border: `2px solid ${error || warningMessage ? '#FF4FB9' : isDark ? '#3988FF' : '#DDE3F4'}`, borderRadius: '14px', boxShadow: isDark ? 'none' : '0 10px 24px rgba(133, 140, 176, 0.12)', height: '196px', mt: '20px', p: '15px', width: '766px' }}>
        <Stack direction='row' justifyContent='space-between'>
          <NumberedTitle
            number={1}
            title={t('Enter amount')}
          />
          <Stack columnGap='5px' direction='row'>
            <ActionButton
              contentPlacement='center'
              onClick={onMaxClick}
              style={amountShortcutButtonStyle}
              text={t('Max')}
              variant='text'
            />
            <ActionButton
              contentPlacement='center'
              onClick={onMinClick}
              style={{
                ...amountShortcutButtonStyle,
                color: isDark ? '#AA83DC' : theme.palette.text.secondary
              }}
              text={t('Min')}
              variant='text'
            />
          </Stack>
        </Stack>
        <Box sx={{ background: isDark ? 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)' : 'linear-gradient(90deg, rgba(221, 227, 244, 0.15) 0%, rgba(221, 227, 244, 1) 50.06%, rgba(221, 227, 244, 0.15) 100%)', height: '1px', my: '10px', width: '100%' }} />
        <MyTextField
          focused
          inputType='number'
          inputValue={inputs?.amount}
          maxLength={20}
          mode='large'
          onEnterPress={noop}
          onTextChange={onAmountChange}
          placeholder='0.00'
        />
        <Box sx={{ background: isDark ? 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)' : 'linear-gradient(90deg, rgba(221, 227, 244, 0.15) 0%, rgba(221, 227, 244, 1) 50.06%, rgba(221, 227, 244, 0.15) 100%)', height: '1px', my: '10px', width: '100%' }} />
        <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='start' onClick={onMaxClick} sx={{ cursor: 'pointer' }}>
          <Typography color='text.secondary' sx={{ textAlign: 'left' }} variant='B-1'>
            {t('Available')}
          </Typography>
          <Logo assetSize='20px' genesisHash={genesisHash} logo={logoInfo?.logo} token={inputs?.token} />
          <DisplayBalance
            balance={transferableBalance}
            decimal={decimal}
            style={{ color: 'text.primary' }}
            token={inputs?.token}
          />
        </Stack>
      </Stack>
      {(inputs?.error || error || warningMessage) &&
        <Stack alignItems='center' columnGap='4px' direction='row' paddingTop='2px'>
          <Warning2 color='#FF4FB9' size='18px' variant='Bold' />
          <Typography color='#FF4FB9' variant='B-4'>
            {error ?? warningMessage}
          </Typography>
        </Stack>
      }
    </Motion>
  );
}
