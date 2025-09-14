// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Inputs } from '../types';

import { ClickAwayListener, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import useUpdateAccountSelectedAsset from '@polkadot/extension-polkagate/src/hooks/useUpdateAccountSelectedAsset';
import getLogo2 from '@polkadot/extension-polkagate/src/util/getLogo2';
import { noop } from '@polkadot/util';

import { AssetLogo } from '../../../components';
import { useAccountAssets, useChainInfo, useTranslation } from '../../../hooks';
import CustomizedDropDown from './CustomizedDropDown';
import OpenerButton from './OpenerButton';

interface Props {
  address: string | undefined;
  assetId: string | undefined;
  genesisHash: string | undefined;
  inputs: Inputs | undefined;
  setInputs: React.Dispatch<React.SetStateAction<Inputs | undefined>>
}

export default function SelectToken ({ address, assetId, genesisHash, inputs, setInputs }: Props): React.ReactElement {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const accountAssets = useAccountAssets(address);
  const { chainName } = useChainInfo(genesisHash, true);

  const [openTokenList, setOpenTokenList] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<string>();

  useUpdateAccountSelectedAsset(address, genesisHash, selectedAsset, true);

  const accountAssetsOnCurrentChain = useMemo(() => accountAssets?.filter((asset) => asset.genesisHash === genesisHash), [accountAssets, genesisHash]);

  useEffect(() => {
    if (!chainName) {
      return;
    }

    const asset = accountAssetsOnCurrentChain?.find((asset) => String(asset.assetId) === String(assetId));

    if (asset) {
      const { assetId, decimal, token } = asset;

      token && setInputs((prev) => ({
        ...(prev || {}),
        assetId,
        decimal, // this is sending token decimal, can be different from the source chain fee/native token decimal
        token
      }));
    }
  }, [accountAssetsOnCurrentChain, assetId, chainName, setInputs]);

  const logoInfo = useMemo(() => inputs?.token && getLogo2(genesisHash, inputs.token), [genesisHash, inputs?.token]);

  const onToggleTokenSelection = useCallback(() => {
    setOpenTokenList(!openTokenList);
  }, [openTokenList]);

  const handleClickAway = useCallback(() => {
    setOpenTokenList(false);
  }, []);

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Stack alignItems='end' direction='row' justifyContent='space-between' mt='15px' onClick={accountAssetsOnCurrentChain?.length ? onToggleTokenSelection : noop} ref={containerRef} sx={{ cursor: accountAssetsOnCurrentChain?.length ? 'pointer' : 'default' }} width='150px'>
          <Stack alignItems='end' direction='row' justifyContent='start'>
            {logoInfo &&
              <AssetLogo assetSize='36px' genesisHash={genesisHash} logo={logoInfo?.logo} />
            }
            <Stack alignItems='center' direction='column' justifyContent='start' ml='7px' width='80%'>
              <Typography color='#AA83DC' sx={{ textAlign: 'left', width: '100%' }} variant='B-4'>
                {t('Token')}
              </Typography>
              <Typography sx={{ textAlign: 'left', width: '100%' }} variant='B-2'>
                {inputs?.token ?? 'Unit'}
              </Typography>
            </Stack>
          </Stack>
          {!!accountAssetsOnCurrentChain?.length &&
            <OpenerButton flip />
          }
        </Stack>
      </ClickAwayListener>
      {!!accountAssetsOnCurrentChain?.length && openTokenList &&
        <CustomizedDropDown
          assets={accountAssetsOnCurrentChain}
          containerRef={containerRef}
          open={openTokenList}
          setSelectedAsset={setSelectedAsset}
        />
      }
    </>
  );
}
