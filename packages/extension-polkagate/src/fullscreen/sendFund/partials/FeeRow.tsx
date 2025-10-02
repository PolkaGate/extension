// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CanPayFee } from '../../../util/types';
import type { FeeInfo, Inputs } from '../types';

import { Box, ClickAwayListener, Stack, Typography } from '@mui/material';
import { deepEqual, type TAssetInfo } from '@paraspell/sdk-pjs';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { encodeLocation } from '@polkadot/extension-polkagate/src/util';
import getLogo2 from '@polkadot/extension-polkagate/src/util/getLogo2';
import { BN } from '@polkadot/util';

import { AssetLogo, DisplayBalance } from '../../../components';
import { useAccount, useAccountAssets, useChainInfo, useFormatted, useTranslation } from '../../../hooks';
import usePartialFee from '../usePartialFee';
import usePayWithAsset from '../usePayWithAsset';
import CustomizedDropDown from './CustomizedDropDown';
import OpenerButton from './OpenerButton';

interface Props {
  address: string | undefined;
  canPayFee?: CanPayFee; // TODO: Needs a fix to be used since it only works for. native assets
  inputs: Inputs;
  genesisHash: string | undefined;
  setInputs: React.Dispatch<React.SetStateAction<Inputs | undefined>>
}

export default function FeeRow ({ address, genesisHash, inputs, setInputs }: Props): React.ReactElement {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const accountAssetsOnOrigin = useAccountAssets(address, genesisHash);
  const account = useAccount(address);
  const { api, chainName, decimal, token } = useChainInfo(genesisHash);
  const feeAssets = usePayWithAsset(chainName);
  const formatted = useFormatted(address, genesisHash);

  const feeAssetsWithBalance = useMemo(() => {
    if (!feeAssets || !accountAssetsOnOrigin) {
      return;
    }

    return feeAssets.filter(
      // @ts-ignore
      ({ assetId, isNative, location }) =>
        accountAssetsOnOrigin.find((a) =>
          (isNative && a.isNative === isNative) ||
          String(a.assetId) === assetId ||
          a.assetId === encodeLocation(location))
    );
  }, [accountAssetsOnOrigin, feeAssets]);

  const [openTokenList, setOpenTokenList] = useState<boolean>(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>();

  const maybeSelectedNonNativeFeeAsset = useMemo(() =>
    feeAssetsWithBalance?.find(({ location }) =>
      encodeLocation(location) === selectedAssetId
    )
    , [feeAssetsWithBalance, selectedAssetId]);

  const maybePartialFee = usePartialFee(api, inputs, formatted, maybeSelectedNonNativeFeeAsset?.location);

  const feeOptions = useMemo(() => {
    if (!feeAssetsWithBalance) {
      return [];
    }

    let normalizedFeeAssets: Omit<TAssetInfo, 'isFeeAsset'>[] = [];
    // @ts-ignore
    const nativeAsset = feeAssetsWithBalance.find(({ isNative }) => isNative);
    // @ts-ignore
    const nonNativeAssets = feeAssetsWithBalance.filter(({ isNative }) => !isNative);

    if (!maybeSelectedNonNativeFeeAsset) {
      normalizedFeeAssets = nonNativeAssets;
    } else {
      const filteredNonNativeAssets = nonNativeAssets?.filter(({ location }) => {
        return !deepEqual(location, maybeSelectedNonNativeFeeAsset.location);
      });

      normalizedFeeAssets = [...filteredNonNativeAssets, ...(nativeAsset ? [nativeAsset] : [])];
    }

    return normalizedFeeAssets.map(({ location, symbol }) => ({
      assetId: encodeLocation(location) as string,
      genesisHash,
      token: symbol
    }));
  }, [feeAssetsWithBalance, genesisHash, maybeSelectedNonNativeFeeAsset]);

  const feeInfo: FeeInfo = useMemo(() => {
    const { asset, fee } = inputs.fee?.destinationFee || {};

    const maybeDestinationFee = inputs?.isCrossChain && asset
      ? {
        assetId: asset.location,
        decimal: asset.decimals,
        fee: new BN(fee || 0),
        token: asset.symbol
      }
      : undefined;

    if (maybeSelectedNonNativeFeeAsset) {
      return {
        assetId: maybeSelectedNonNativeFeeAsset?.location,
        decimal: Number(maybeSelectedNonNativeFeeAsset.decimals),
        fee: maybePartialFee,
        token: maybeSelectedNonNativeFeeAsset.symbol.toString(),
        // eslint-disable-next-line sort-keys
        destinationFee: maybeDestinationFee
      };
    }

    return {
      decimal,
      destinationFee: maybeDestinationFee,
      fee: inputs.fee?.originFee.fee ? new BN(inputs.fee?.originFee.fee) : undefined,
      token
    };
  }, [inputs.fee, inputs?.isCrossChain, maybeSelectedNonNativeFeeAsset, decimal, token, maybePartialFee]);

  useEffect(() => {
    setInputs((prevInputs) => ({
      ...(prevInputs || {}),
      feeInfo
    }));
  }, [feeInfo, setInputs]);

  const feeLogoInfo = useMemo(() =>
    getLogo2(genesisHash, feeInfo.token)
    , [feeInfo.token, genesisHash]);

  const maybeDestinationChainFeeLogoInfo = useMemo(() =>
    inputs.recipientChain?.text && feeInfo.destinationFee?.token
      ? getLogo2(inputs.recipientChain?.text, feeInfo.destinationFee.token)
      : undefined
    , [feeInfo.destinationFee?.token, inputs.recipientChain?.text]);

  const onToggleTokenSelection = useCallback(() => {
    setOpenTokenList(!openTokenList);
  }, [openTokenList]);

  const handleClickAway = useCallback(() => {
    setOpenTokenList(false);
  }, []);

  const showFeeSelector = !!feeOptions?.length && !account?.isExternal;

  return (

    <Stack direction='column' sx={{ m: '25px 10px 20px', width: '766px' }}>
      <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ height: '22px', pl: '10px', pr: showFeeSelector ? '7px' : '20px' }}>
        <Typography color='primary.main' sx={{ textAlign: 'left' }} variant='B-1'>
          {inputs?.isCrossChain ? t('Network fee') : t('Estimated fee')}
        </Typography>
        <ClickAwayListener onClickAway={handleClickAway}>
          <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='end' ref={containerRef} sx={{ transform: showFeeSelector ? 'translateX(-3px)' : 'translateX(0)', transition: 'all 400ms ease-out' }}>
            {/* {canPayFee.isAbleToPay === false && canPayFee.warning &&
              <UnableToPayFee warningText={canPayFee.warning} />
            } */}
            <DisplayBalance
              balance={feeInfo.fee}
              decimal={feeInfo.decimal}
              style={{
                color: 'text.primary',
                ml: '5px'
              }}
              token={feeInfo.token}
            />
            <AssetLogo assetSize='18px' genesisHash={genesisHash} logo={feeLogoInfo?.logo} />
            {showFeeSelector &&
              <OpenerButton
                flip
                onClick={onToggleTokenSelection}
              />
            }
          </Stack>
        </ClickAwayListener>
        {showFeeSelector && openTokenList &&
          <CustomizedDropDown
            assets={feeOptions}
            containerRef={containerRef}
            isSmall
            open={openTokenList}
            setSelectedAsset={setSelectedAssetId}
            style={{ marginLeft: '6px' }}
          />
        }
      </Stack>
      <Box sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', my: '10px', width: '766px' }} />
      {inputs?.isCrossChain &&
        <>
          <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ height: '22px', pl: '10px', pr: showFeeSelector ? '7px' : '20px' }}>
            <Typography color='primary.main' sx={{ textAlign: 'left' }} variant='B-1'>
              {t('Cross-chain fee')}
            </Typography>
            <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='end' sx={{ transform: showFeeSelector ? 'translateX(-3px)' : 'translateX(0)', transition: 'all 400ms ease-out' }}>
              {/* {canPayFee.isAbleToPay === false && canPayFee.warning &&
                <UnableToPayFee warningText={canPayFee.warning} />
              } */}
              <DisplayBalance
                balance={feeInfo.destinationFee?.fee}
                decimal={feeInfo.destinationFee?.decimal}
                style={{
                  color: 'text.primary',
                  ml: '5px'
                }}
                token={feeInfo.destinationFee?.token}
              />
              <AssetLogo
                assetSize='18px'
                chainName={inputs.recipientChain?.text}
                logo={maybeDestinationChainFeeLogoInfo?.logo}
                token={feeInfo.destinationFee?.token}
              />
            </Stack>
          </Stack>
          <Box sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', my: '10px', width: '766px' }} />
        </>
      }
    </Stack>);
}
