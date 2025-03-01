// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, type SxProps, type Theme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import { useAccountAssetsOptions, useAssetHubAssets, useChain, useTokens } from '@polkadot/extension-polkagate/src/hooks';

import Select2 from './Select2';

interface Props {
  address: string | null | undefined;
  onChange: (value: any) => void;
  label: string;
  style: SxProps<Theme> | undefined;
  assetId: number | undefined;
  setAssetId: React.Dispatch<React.SetStateAction<number | undefined>>

}

function Assets({ address, assetId, label, onChange, setAssetId, style }: Props) {
  const tokens = useTokens(address as string);
  const chain = useChain(address);
  const assetHubOptions = useAssetHubAssets(address as string); // TODO: should we show zero or spam assets?!
  const multiChainAssetsOptions = useAccountAssetsOptions(address as string);
  const options = useMemo(() =>
    assetHubOptions
      ? (tokens || []).concat(assetHubOptions || [])
      : multiChainAssetsOptions || tokens || []
    , [assetHubOptions, multiChainAssetsOptions, tokens]);

  const [isLoading, setLoading] = useState<boolean>();

  useEffect(() => {
    setAssetId(undefined); // this will set the asset to the native asset on chain switch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain]);

  useEffect(() => {
    if (assetHubOptions === undefined && multiChainAssetsOptions === undefined) {
      setAssetId(undefined);

      return setLoading(true);
    }

    setLoading(false);
  }, [assetHubOptions, multiChainAssetsOptions, setAssetId]);

  return (
    <Grid alignItems='flex-end' container justifyContent='space-between' sx={{ ...style }}>
      <Select2
        defaultValue={options?.[0]?.text}
        isItemsLoading={isLoading}
        label={label}
        onChange={onChange}
        options={options}
        showIcons={false}
        value={assetId}
      />
    </Grid>
  );
}

export default React.memo(Assets);
