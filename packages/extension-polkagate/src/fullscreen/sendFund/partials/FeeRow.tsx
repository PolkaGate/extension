// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CanPayFee, FetchedBalance } from '../../../util/types';
import type { FeeInfo, Inputs } from '../types';

import { ClickAwayListener, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { FLOATING_POINT_DIGIT, NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB } from '@polkadot/extension-polkagate/src/util/constants';
import getLogo2 from '@polkadot/extension-polkagate/src/util/getLogo2';
import { isOnAssetHub } from '@polkadot/extension-polkagate/src/util/utils';

import { AssetLogo, ShowBalance4 } from '../../../components';
import { useAccount, useChainInfo, useFormatted, useTranslation } from '../../../hooks';
import { UnableToPayFee } from '../../../partials';
import usePartialFee from '../usePartialFee';
import usePayWithAsset from '../usePayWithAsset';
import CustomizedDropDown from './CustomizedDropDown';
import OpenerButton from './OpenerButton';

interface Props {
  address: string | undefined;
  canPayFee: CanPayFee;
  inputs: Inputs;
  genesisHash: string | undefined;
  setInputs: React.Dispatch<React.SetStateAction<Inputs | undefined>>
}

export default function FeeRow ({ address, canPayFee, genesisHash, inputs, setInputs }: Props): React.ReactElement {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const { api, decimal, token } = useChainInfo(genesisHash);
  const feeAssets = usePayWithAsset(genesisHash);
  const formatted = useFormatted(address, genesisHash);
  const account = useAccount(address);

  const [openTokenList, setOpenTokenList] = useState<boolean>(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>();

  const maybeSelectedNonNativeFeeAsset = useMemo(() => feeAssets?.find(({ id }) => id.toString() === selectedAssetId), [feeAssets, selectedAssetId]);
  const maybePartialFee = usePartialFee(api, inputs, formatted, maybeSelectedNonNativeFeeAsset?.multiLocation);

  const feeAssetsToShow = useMemo(() => {
    const nativeAsset = {
      assetId: isOnAssetHub(genesisHash) ? NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB : NATIVE_TOKEN_ASSET_ID,
      genesisHash,
      token
    };

    const nonNativeAssets = feeAssets?.map(({ id, symbol }) => ({ assetId: id, genesisHash, token: symbol }));

    if (!maybeSelectedNonNativeFeeAsset) {
      return nonNativeAssets as unknown as Partial<FetchedBalance>[];
    }

    const filteredNonNativeAssets = nonNativeAssets?.filter(({ assetId }) => {
      return assetId?.toString() !== maybeSelectedNonNativeFeeAsset.id.toString();
    }) as unknown as Partial<FetchedBalance>[];

    return [...filteredNonNativeAssets, nativeAsset] as Partial<FetchedBalance>[];
  }, [feeAssets, genesisHash, maybeSelectedNonNativeFeeAsset, token]);

  const feeInfo: FeeInfo = useMemo(() => {
    if (maybeSelectedNonNativeFeeAsset) {
      return {
        assetId: maybeSelectedNonNativeFeeAsset?.multiLocation,
        decimal: Number(maybeSelectedNonNativeFeeAsset.decimals),
        fee: maybePartialFee,
        token: maybeSelectedNonNativeFeeAsset.symbol.toString()
      };
    }

    return {
      decimal,
      fee: inputs.fee,
      token
    };
  }, [decimal, inputs.fee, maybeSelectedNonNativeFeeAsset, maybePartialFee, token]);

  useEffect(() => {
    setInputs((prevInputs) => ({
      ...(prevInputs || {}),
      feeInfo
    }));
  }, [feeInfo, setInputs]);

  const feeLogoInfo = useMemo(() => getLogo2(genesisHash, feeInfo.token), [feeInfo.token, genesisHash]);
  const onToggleTokenSelection = useCallback(() => {
    setOpenTokenList(!openTokenList);
  }, [openTokenList]);

  const handleClickAway = useCallback(() => {
    setOpenTokenList(false);
  }, []);

  const showFeeSelector = !!feeAssets?.length && !account?.isExternal;

  return (
    <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ height: '22px', px: '15px' }}>
      <Typography color='primary.main' sx={{ textAlign: 'left' }} variant='B-1'>
        {t('Estimated fee')}
      </Typography>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='end' ref={containerRef} sx={{ transform: showFeeSelector ? 'translateX(0)' : 'translateX(10px)', transition: 'all 400ms ease-out' }}>
          {canPayFee.isAbleToPay === false && canPayFee.warning &&
            <UnableToPayFee warningText={canPayFee.warning} />
          }
          <Typography color='text.primary' sx={{ ml: '5px', textAlign: 'left' }} variant='B-1'>
            <ShowBalance4
              balance={feeInfo.fee}
              decimal={feeInfo.decimal}
              decimalPoint={FLOATING_POINT_DIGIT}
              token={feeInfo.token}
            />
          </Typography>
          <AssetLogo assetSize='18px' genesisHash={genesisHash} logo={feeLogoInfo?.logo} />
          {showFeeSelector &&
            <OpenerButton
              flip
              onClick={onToggleTokenSelection}
            />
          }
        </Stack>
      </ClickAwayListener>
      {!!feeAssets?.length && openTokenList &&
        <CustomizedDropDown
          assets={feeAssetsToShow}
          containerRef={containerRef}
          open={openTokenList}
          setSelectedAsset={setSelectedAssetId}
          style={{ marginLeft: '6px' }}
        />
      }
    </Stack>
  );
}
