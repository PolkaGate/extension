// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsicFunction } from '@polkadot/api-base/types';
import type { Teleport } from '@polkadot/extension-polkagate/src/hooks/useTeleport';
import type { TransferType } from '@polkadot/extension-polkagate/src/util/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type { HexString } from '@polkadot/util/types';
import type { Inputs } from '.';

import { Box, Stack, Typography } from '@mui/material';
import { Warning2 } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { getValue } from '@polkadot/extension-polkagate/src/popup/account/util';
import { ASSET_HUBS, FLOATING_POINT_DIGIT, NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB } from '@polkadot/extension-polkagate/src/util/constants';
import getLogo2 from '@polkadot/extension-polkagate/src/util/getLogo2';
import { amountToMachine } from '@polkadot/extension-polkagate/src/util/numberUtils';
import { amountToHuman, decodeMultiLocation } from '@polkadot/extension-polkagate/src/util/utils';
import { BN_ONE, BN_ZERO, isFunction, isNumber, noop } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { ActionButton, AssetLogo, Motion, MyTextField, ShowBalance4 } from '../../components';
import { useAccountAssets, useChainInfo, useFormatted3, useTranslation } from '../../hooks';

interface Props {
  inputs: Inputs | undefined;
  teleportState: Teleport;
  setInputs: React.Dispatch<React.SetStateAction<Inputs | undefined>>;
}

const XCM_LOC = ['xcm', 'xcmPallet', 'polkadotXcm'];
const INVALID_PARA_ID = Number.MAX_SAFE_INTEGER;
const isAssethub = (genesisHash?: string) => ASSET_HUBS.includes(genesisHash || '');

export default function Step3Amount ({ inputs, setInputs, teleportState }: Props): React.ReactElement {
  const { t } = useTranslation();

  const { address, assetId, genesisHash } = useParams<{ address: string, genesisHash: string, assetId: string }>();
  const accountAssets = useAccountAssets(address);
  const { api, chain, decimal } = useChainInfo(genesisHash);
  const formatted = useFormatted3(address, genesisHash);

  const assetToTransfer = useMemo(() =>
    accountAssets?.find((asset) => asset.genesisHash === genesisHash && String(asset.assetId) === assetId),
  [accountAssets, assetId, genesisHash]);

  const transferableBalance = useMemo(() => getValue('transferable', assetToTransfer), [assetToTransfer]);
  const logoInfo = useMemo(() => getLogo2(genesisHash, assetToTransfer?.token), [assetToTransfer?.token, genesisHash]);
  const isForeignAsset = assetId ? assetId.startsWith('0x') : undefined;
  const noAssetId = assetId === undefined || assetId === 'undefined';
  const isNativeToken = String(assetId) === String(NATIVE_TOKEN_ASSET_ID) || String(assetId) === String(NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB);
  const isNonNativeToken = !noAssetId && !isNativeToken;

  const parsedAssetId = useMemo(() => noAssetId || isNativeToken
    ? undefined
    : isForeignAsset
      ? decodeMultiLocation(assetId as HexString)
      : parseInt(assetId)
  , [assetId, isForeignAsset, isNativeToken, noAssetId]);

  const recipientChainGenesisHash = inputs?.recipientGenesisHashOrParaId;

  const [error, setError] = useState<string | undefined>();
  const [amount, setAmount] = useState<string | undefined>(inputs?.amount);
  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [estimatedCrossChainFee, setEstimatedCrossChainFee] = useState<Balance>();
  const [recipientAddress, setRecipientAddress] = useState<string | undefined>(inputs?.recipientAddress);
  const [recipientParaId, setParaId] = useState(INVALID_PARA_ID);
  const [transferType, setTransferType] = useState<TransferType>('Normal');
  const [maxFee, setMaxFee] = useState<Balance>();

  const amountAsBN = useMemo(() => decimal ? amountToMachine(amount, decimal) : undefined, [amount, decimal]);

  const warningMessage = useMemo(() => {
    if (transferType !== 'All' && amountAsBN && decimal && assetToTransfer && transferableBalance) {
      const toTransferBalance = isNonNativeToken
        ? amountAsBN
        : amountAsBN.add(estimatedFee || BN_ZERO).add(estimatedCrossChainFee || BN_ZERO);

      const remainingBalanceAfterTransfer = assetToTransfer.totalBalance.sub(toTransferBalance);

      if (transferableBalance.isZero() || transferableBalance.lt(toTransferBalance)) {
        return t('There is no sufficient transferable balance!');
      }

      if (remainingBalanceAfterTransfer.lt(assetToTransfer.ED) && remainingBalanceAfterTransfer.gt(BN_ZERO)) {
        return t('This transaction will drop your balance below the Existential Deposit threshold, risking account reaping.');
      }
    }

    return undefined;
  }, [transferType, amountAsBN, decimal, assetToTransfer, transferableBalance, isNonNativeToken, estimatedFee, estimatedCrossChainFee, t]);

  const isCrossChain = useMemo(() => recipientChainGenesisHash !== chain?.genesisHash, [chain?.genesisHash, recipientChainGenesisHash]);

  const onChainCall = useMemo(() => {
    if (!api || !chain) {
      return undefined;
    }

    try {
      const module = isNonNativeToken
        ? isAssethub(chain.genesisHash)
          ? isForeignAsset
            ? 'foreignAssets'
            : 'assets'
          : api.tx?.['currencies']
            ? 'currencies'
            : 'tokens'
        : 'balances';

      if (['currencies', 'tokens'].includes(module)) {
        return api.tx[module]['transfer'];
      }

      return api.tx?.[module] && (
        transferType === 'Normal'
          ? api.tx[module]['transferKeepAlive']
          : isNonNativeToken
            ? api.tx[module]['transfer']
            : api.tx[module]['transferAll']
      );
    } catch (e) {
      console.log('Something wrong while making on chain call!', e);

      return undefined;
    }
  }, [api, isNonNativeToken, chain, isForeignAsset, transferType]);

  const call = useMemo((): SubmittableExtrinsicFunction<'promise'> | undefined => {
    if (!api) {
      return;
    }

    if (isCrossChain) {
      const m = XCM_LOC.filter((x) => api.tx[x] && isFunction(api.tx[x]['limitedTeleportAssets']))?.[0];

      return m ? api.tx[m]['limitedTeleportAssets'] : undefined;
    }

    return onChainCall;
  }, [api, isCrossChain, onChainCall]);

  const calculateFee = useCallback((amount: Balance | BN, setFeeCall: React.Dispatch<React.SetStateAction<Balance | undefined>>) => {
    /** to set Maximum fee which will be used to estimate and show max transferable amount */
    if (!api || !assetToTransfer || !formatted || !onChainCall) {
      return;
    }

    if (!api?.call?.['transactionPaymentApi']) {
      const dummyAmount = api.createType('Balance', BN_ONE);

      return setFeeCall(dummyAmount);
    }

    const _params = isNonNativeToken
      ? ['currencies', 'tokens'].includes(onChainCall.section)
        ? [formatted, assetToTransfer.currencyId, amount]
        : [parsedAssetId, formatted, amount]
      : [formatted, amount];

    onChainCall(..._params).paymentInfo(formatted).then((i) => setFeeCall(i?.partialFee)).catch(console.error);
  }, [api, formatted, assetToTransfer, onChainCall, isNonNativeToken, parsedAssetId]);

  const crossChainParams = useMemo(() => {
    if (!api || !assetToTransfer || !teleportState || isCrossChain === false || (recipientParaId === INVALID_PARA_ID && !teleportState?.isParaTeleport) || Number(amount) === 0) {
      return;
    }

    return [
      {
        V3: teleportState.isParaTeleport
          ? { interior: 'Here', parents: 1 }
          : { interior: { X1: { ParaChain: recipientParaId } }, parents: 0 }
      },
      {
        V3: {
          interior: {
            X1: {
              AccountId32: {
                id: api.createType('AccountId32', recipientAddress).toHex(),
                network: null
              }
            }
          },
          parents: 0
        }
      },
      {
        V3: [{
          fun: { Fungible: amountToMachine(amount, decimal) },
          id: {
            Concrete: {
              interior: 'Here',
              parents: teleportState.isParaTeleport ? 1 : 0
            }
          }
        }]
      },
      0,
      { Unlimited: null }
    ];
  }, [api, assetToTransfer, teleportState, isCrossChain, recipientParaId, amount, recipientAddress, decimal]);

  useEffect(() => {
    if (isNumber(recipientChainGenesisHash) && isCrossChain) {
      setParaId(parseInt(recipientChainGenesisHash));
    }
  }, [isCrossChain, recipientChainGenesisHash]);

  useEffect(() => {
    if (!assetToTransfer || recipientAddress === undefined || !amountAsBN) {
      return;
    }

    setInputs((prevInputs) => ({
      ...(prevInputs || {}),
      amount,
      call,
      params: (isCrossChain
        ? crossChainParams
        : isNonNativeToken
          ? ['currencies', 'tokens'].includes(onChainCall?.section || '')
            ? [recipientAddress, assetToTransfer.currencyId, amountAsBN] // this is for transferring on mutliasset chains
            : [parsedAssetId, recipientAddress, amountAsBN] // this is for transferring on asset hubs
          : transferType === 'All'
            ? [recipientAddress, false] // transferAll with keepalive = false
            : [recipientAddress, amountAsBN]) as unknown[],
      totalFee: estimatedFee ? estimatedFee.add(estimatedCrossChainFee || BN_ZERO) : undefined
    }));
  }, [amountAsBN, estimatedFee, estimatedCrossChainFee, setInputs, call, parsedAssetId, recipientAddress, isCrossChain, crossChainParams, isNonNativeToken, formatted, amount, transferType, onChainCall?.section, assetToTransfer]);

  useEffect(() => {
    if (!api || !transferableBalance) {
      return;
    }

    calculateFee(transferableBalance, setMaxFee);
  }, [api, calculateFee, transferableBalance]);

  useEffect(() => {
    if (!api || amountAsBN === undefined || !assetToTransfer) {
      return;
    }

    calculateFee(amountAsBN || BN_ZERO, setEstimatedFee);
  }, [amountAsBN, api, assetToTransfer, calculateFee]);

  const reformatRecipientAddress = useCallback(() => {
    if (!recipientAddress || chain?.ss58Format === undefined) {
      return;
    }

    const publicKey = decodeAddress(recipientAddress);
    const newFormattedAddress = encodeAddress(publicKey, chain.ss58Format);

    setRecipientAddress(newFormattedAddress);
  }, [chain?.ss58Format, recipientAddress]);

  useEffect(() => {
    chain && reformatRecipientAddress();
  }, [chain, reformatRecipientAddress]);

  useEffect(() => {
    if (!call || !crossChainParams || !formatted) {
      return setEstimatedCrossChainFee(undefined);
    }

    isCrossChain && call(...crossChainParams).paymentInfo(formatted).then((i) => setEstimatedCrossChainFee(i?.partialFee)).catch(console.error);
  }, [call, formatted, isCrossChain, crossChainParams]);

  const onMaxClick = useCallback(() => {
    if (!transferableBalance || !maxFee || !assetToTransfer) {
      return setError(t('Please wait a little bit while we are updating balances, and try again later!'));
    }

    setTransferType('All');

    const isAvailableZero = transferableBalance.isZero();

    const _maxFee = isNativeToken ? maxFee : BN_ZERO;

    const canNotTransfer = isAvailableZero || _maxFee.gte(transferableBalance);
    const allAmount = canNotTransfer ? '0' : amountToHuman(transferableBalance.sub(_maxFee).toString(), decimal);

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

  const onMinClick = useCallback(() => {
    setInputs((prevInputs) => ({
      ...(prevInputs || {}),
      amount: '1'
    }));
  }, [setInputs]);

  return (
    <Motion variant='slide'>
      <Typography color='text.secondary' sx={{ mt: '15px', textAlign: 'left', width: '100%' }} variant='B-4'>
        {t('Input transfer amount')}
      </Typography>
      <Stack direction='column' justifyContent='space-between' sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '196px', mt: '20px', p: '15px', width: '766px' }}>
        <Stack direction='row' justifyContent='space-between'>
          <Stack columnGap='5px' direction='row'>
            <Box sx={{ alignItems: 'center', background: '#6743944D', borderRadius: '50%', display: 'flex', height: '20px', justifyContent: 'center', width: '20px' }}>
              <Typography color='#AA83DC' sx={{ textAlign: 'center' }} variant='B-3'>
                1
              </Typography>
            </Box>
            <Typography color='text.primary' sx={{ textAlign: 'center' }} variant='B-1'>
              {t('Enter amount')}
            </Typography>
          </Stack>
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
        <Box sx={{ background: error ? '#FF4FB9' : 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', my: '10px', width: '100%' }} />
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
        {(error || warningMessage) &&
          <Stack alignItems='center' columnGap='4px' direction='row' paddingTop='2px'>
            <Warning2 color='#FF4FB9' size='18px' variant='Bold' />
            <Typography color='#FF4FB9' variant='B-4'>
              {error ?? warningMessage}
            </Typography>
          </Stack>
        }
        <Box sx={{ background: error ? '#FF4FB9' : 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', my: '10px', width: '100%' }} />
        <Stack columnGap='5px' direction='row' justifyContent='start'>
          <Typography color='text.secondary' sx={{ textAlign: 'left' }} variant='B-1'>
            {t('Available')}
          </Typography>
          <AssetLogo assetSize='18px' genesisHash={genesisHash} logo={logoInfo?.logo} />
          <Typography color='text.primary' sx={{ textAlign: 'left' }} variant='B-1'>
            <ShowBalance4
              balance={transferableBalance}
              decimalPoint={FLOATING_POINT_DIGIT}
              genesisHash={genesisHash}
            />
          </Typography>
        </Stack>
      </Stack>
    </Motion>
  );
}
