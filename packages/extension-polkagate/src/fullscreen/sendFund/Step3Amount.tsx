// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Teleport } from '@polkadot/extension-polkagate/src/hooks/useTeleport';
import type { TransferType } from '@polkadot/extension-polkagate/src/util/types';
import type { BN } from '@polkadot/util';
import type { Inputs } from './types';

import { Box, Stack, Typography } from '@mui/material';
import { getExistentialDeposit, type TNodeWithRelayChains } from '@paraspell/sdk-pjs';
import { Warning2 } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { getValue } from '@polkadot/extension-polkagate/src/popup/account/util';
import { FLOATING_POINT_DIGIT, NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB, TEST_NETS } from '@polkadot/extension-polkagate/src/util/constants';
import getLogo2 from '@polkadot/extension-polkagate/src/util/getLogo2';
import { amountToHuman, amountToMachine } from '@polkadot/extension-polkagate/src/util/numberUtils';
import { BN_ZERO, noop } from '@polkadot/util';

import { ActionButton, AssetLogo, Motion, MyTextField, ShowBalance4 } from '../../components';
import { useAccountAssets, useChainInfo, useTranslation } from '../../hooks';
import NumberedTitle from './partials/NumberedTitle';
import useLimitedFeeCall from './useLimitedFeeCall';
import useParaSpellFeeCall from './useParaSpellFeeCall';
import useWarningMessage from './useWarningMessage';
import { isOnSameChain, normalizeChainName } from './utils';

interface Props {
  inputs: Inputs | undefined;
  teleportState: Teleport;
  setInputs: React.Dispatch<React.SetStateAction<Inputs | undefined>>;
}

export default function Step3Amount ({ inputs, setInputs, teleportState }: Props): React.ReactElement {
  const { t } = useTranslation();

  const { address, assetId, genesisHash } = useParams<{ address: string, genesisHash: string, assetId: string }>();
  const accountAssets = useAccountAssets(address);
  const { api, chainName: senderChainName } = useChainInfo(genesisHash);
  const decimal = inputs?.decimal;

  const [error, setError] = useState<string | undefined>();
  const [amount, setAmount] = useState<string | undefined>(inputs?.amount);
  const [transferType, setTransferType] = useState<TransferType>('Normal');
  const assetToTransfer = useMemo(() => accountAssets?.find((asset) => asset.genesisHash === genesisHash && String(asset.assetId) === assetId), [accountAssets, assetId, genesisHash]);
  const transferableBalance = useMemo(() => getValue('transferable', assetToTransfer), [assetToTransfer]);
  const logoInfo = useMemo(() => getLogo2(genesisHash, assetToTransfer?.token), [assetToTransfer?.token, genesisHash]);
  const isNativeToken = String(assetId) === String(NATIVE_TOKEN_ASSET_ID) || String(assetId) === String(NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB);
  const amountAsBN = useMemo(() => decimal ? amountToMachine(amount, decimal) : undefined, [amount, decimal]);

  const { maxFee, totalFee, transaction } = useLimitedFeeCall(address, assetId, assetToTransfer, inputs, genesisHash, teleportState, transferType);
  const warningMessage = useWarningMessage(assetId, amountAsBN, assetToTransfer, decimal, transferType, totalFee);
  const { paraSpellFee, paraSpellTransaction } = useParaSpellFeeCall(address, amountAsBN, genesisHash, inputs, senderChainName, setError);

  useEffect(() => {
    // we only use these parts to support testnets otherwise we use paraSpell to form the transaction
    if (!transaction) {
      return;
    }

    setInputs((prevInputs) => ({
      ...(prevInputs || {}),
      transaction
    }));
  }, [setInputs, transaction]);

  useEffect(() => {
    if (!genesisHash) {
      return;
    }

    const _isOnSameChain = isOnSameChain(senderChainName, inputs?.recipientChain?.text);

    if ((TEST_NETS.includes(genesisHash) || _isOnSameChain) && totalFee) {
      setInputs((prevInputs) => {
        if (prevInputs?.fee?.eq?.(totalFee)) {
          return prevInputs;
        }

        return { ...prevInputs, fee: totalFee };
      });
    }

    paraSpellFee && setInputs((prevInputs) => {
      if (prevInputs?.fee?.eq?.(paraSpellFee)) {
        return prevInputs;
      }

      return { ...prevInputs, fee: paraSpellFee };
    });
  }, [genesisHash, inputs?.recipientChain?.text, paraSpellFee, senderChainName, setInputs, totalFee]);

  useEffect(() => {
    paraSpellTransaction && setInputs((prevInputs) => ({
      ...(prevInputs || {}),
      paraSpellTransaction
    }));
  }, [paraSpellTransaction, setInputs]);

  useEffect(() => {
    amountAsBN && setInputs((prevInputs) => ({
      ...(prevInputs || {}),
      amountAsBN
    }));
  }, [amountAsBN, setInputs]);

  const onMaxClick = useCallback(() => {
    if (!transferableBalance || !maxFee || !assetToTransfer) {
      return setError(t('We’re updating your balance — please wait a moment and try again.'));
    }

    const isAvailableZero = transferableBalance.isZero();
    const _maxFee = isNativeToken ? maxFee : BN_ZERO;
    const canNotTransfer = isAvailableZero || _maxFee.gte(transferableBalance);
    const allAmount = canNotTransfer ? '0' : amountToHuman(transferableBalance.sub(_maxFee).toString(), decimal);

    setError(undefined);
    setTransferType('All');
    setAmount(allAmount);
    setInputs((prevInputs) => ({
      ...(prevInputs || {}),
      amount: allAmount
    }));
  }, [assetToTransfer, decimal, isNativeToken, maxFee, setInputs, t, transferableBalance]);

  const onAmountChange = useCallback((value: string) => {
    if (!assetToTransfer || !decimal) {
      return;
    }

    setError(undefined);
    const toTransferAmount = amountToMachine(value, decimal);

    if (transferableBalance && toTransferAmount?.gt(transferableBalance)) {
      return setError(t('Amount will exceed transferable balance!'));
    }

    setTransferType('Normal');
    setError(undefined);
    setAmount(value);
    setInputs((prevInputs) => ({
      ...(prevInputs || {}),
      amount: value
    }));
  }, [assetToTransfer, decimal, setInputs, t, transferableBalance]);

  const ED = useMemo(() => {
    let maybeED = '1';

    try {
      let mayBeEDasBN;

      if (senderChainName && inputs?.token && !TEST_NETS.includes(genesisHash ?? '')) {
        const _senderChainName = normalizeChainName(senderChainName);

        mayBeEDasBN = getExistentialDeposit(_senderChainName as TNodeWithRelayChains, { symbol: inputs.token });
      } else {
        mayBeEDasBN = api?.consts['balances']['existentialDeposit'] as unknown as BN;
      }

      if (mayBeEDasBN) {
        maybeED = amountToHuman(mayBeEDasBN, decimal);
      }

      return maybeED;
    } catch {
      return maybeED;
    }
  }, [api?.consts, decimal, genesisHash, inputs?.token, senderChainName]);

  const onMinClick = useCallback(() => {
    setError(undefined);
    setAmount(ED);
    setInputs((prevInputs) => ({
      ...(prevInputs || {}),
      amount: ED
    }));
  }, [ED, setInputs]);

  return (
    <Motion variant='slide'>
      <Typography color='text.secondary' sx={{ mt: '15px', textAlign: 'left', width: '100%' }} variant='B-4'>
        {t('Input transfer amount')}
      </Typography>
      <Stack direction='column' justifyContent='space-between' sx={{ bgcolor: '#05091C', border: `2px solid ${error || warningMessage ? '#FF4FB9' : '#3988FF'}`, borderRadius: '14px', height: '196px', mt: '20px', p: '15px', width: '766px' }}>
        <Stack direction='row' justifyContent='space-between'>
          <NumberedTitle
            number={1}
            title={t('Enter amount')}
          />
          <Stack columnGap='5px' direction='row'>
            <ActionButton
              contentPlacement='center'
              onClick={onMaxClick}
              style={{
                height: '26px',
                minWidth: 'fit-content',
                padding: '0 10px',
                width: 'fit-content'
              }}
              text={t('Max')}
              variant='text'
            />
            <ActionButton
              contentPlacement='center'
              onClick={onMinClick}
              style={{
                color: '#AA83DC',
                height: '26px',
                minWidth: 'fit-content',
                padding: '0 10px',
                width: 'fit-content'
              }}
              text={t('Min')}
              variant='text'
            />
          </Stack>
        </Stack>
        <Box sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', my: '10px', width: '100%' }} />
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
        <Box sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', my: '10px', width: '100%' }} />
        <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='start'>
          <Typography color='text.secondary' sx={{ textAlign: 'left' }} variant='B-1'>
            {t('Available')}
          </Typography>
          <AssetLogo assetSize='18px' genesisHash={genesisHash} logo={logoInfo?.logo} />
          <Typography color='text.primary' sx={{ textAlign: 'left' }} variant='B-1'>
            <ShowBalance4
              balance={transferableBalance}
              decimal={decimal}
              decimalPoint={FLOATING_POINT_DIGIT}
              genesisHash={genesisHash}
              token={inputs?.token}
            />
          </Typography>
        </Stack>
      </Stack>
      {(error || warningMessage) &&
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
