// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance } from '@polkadot/extension-polkagate/src/util/types';
import type { Inputs } from '../types';

import { ClickAwayListener, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import useUpdateAccountSelectedAsset from '@polkadot/extension-polkagate/src/hooks/useUpdateAccountSelectedAsset';
import getLogo2 from '@polkadot/extension-polkagate/src/util/getLogo2';
import { noop } from '@polkadot/util';

import { AssetLogo } from '../../../components';
import { useTranslation } from '../../../hooks';
import CustomizedDropDown from './CustomizedDropDown';
import OpenerButton from './OpenerButton';

interface Props {
  address: string | undefined;
  assetId: string | undefined;
  genesisHash: string | undefined;
  inputs: Inputs | undefined;
  setInputs: React.Dispatch<React.SetStateAction<Inputs | undefined>>
  accountAssets: FetchedBalance[] | undefined

}

export default function SelectToken({ accountAssets, address, assetId, genesisHash, inputs, setInputs }: Props): React.ReactElement {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const [openTokenList, setOpenTokenList] = useState<boolean>(false);
  const [selectedAssetId, setSelectedAsset] = useState<string>();

  const asset = useMemo(() => {
    const list = accountAssets ?? [];
    const id = selectedAssetId ?? assetId;

    return list.find((a) => String(a.assetId) === String(id)) ?? list[0];
  }, [accountAssets, assetId, selectedAssetId]);

  const _urlAssetId = useMemo(() => selectedAssetId ?? asset?.assetId, [asset?.assetId, selectedAssetId]);

  useUpdateAccountSelectedAsset(address, genesisHash, _urlAssetId, true);

  useEffect(() => {
    if (asset) {
      const { assetId, decimal, token } = asset;

      token && setInputs((prev) => ({
        ...(prev || {}),
        assetId,
        decimal, // this is sending token decimal, can be different from the source chain fee/native token decimal
        token
      }));
    }
  }, [asset, setInputs]);

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
        <Stack alignItems='end' direction='row' justifyContent='space-between' mt='15px' onClick={accountAssets?.length ? onToggleTokenSelection : noop} ref={containerRef} sx={{ cursor: accountAssets?.length ? 'pointer' : 'default' }} width='150px'>
          <Stack alignItems='end' direction='row' justifyContent='start'>
            {logoInfo &&
              <AssetLogo assetSize='36px' genesisHash={genesisHash} logo={logoInfo?.logo} token={asset?.token} />
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
          {!!accountAssets?.length &&
            <OpenerButton flip />
          }
        </Stack>
      </ClickAwayListener>
      {!!accountAssets?.length && openTokenList &&
        <CustomizedDropDown
          assets={accountAssets}
          containerRef={containerRef}
          open={openTokenList}
          setSelectedAsset={setSelectedAsset}
        />
      }
    </>
  );
}
