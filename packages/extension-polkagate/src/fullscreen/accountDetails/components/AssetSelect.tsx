// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, type SxProps, type Theme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import Select2 from '../../../components/Select2';
import { useAssetHubAssets, useTokens } from '../../../hooks';

interface Props {
  address: string | undefined;
  onChange: (value: number | string) => void;
  label: string;
  style: SxProps<Theme> | undefined;
  assetId: number | string | undefined;
  setAssetId: React.Dispatch<React.SetStateAction<number | string | undefined>>
}

function AssetSelect({ address, assetId, label, onChange, setAssetId, style }: Props) {
  const tokens = useTokens(address);
  const assets = useAssetHubAssets(address);
  const options = useMemo(() => (tokens || []).concat(assets || []), [assets, tokens]);

  const [isLoading, setLoading] = useState<boolean>();

  useEffect(() => {
    if (assets === undefined) {
      setAssetId(undefined);

      return setLoading(true);
    }

    setLoading(false);
  }, [assets, setAssetId]);

  return (
    <Grid container sx={{ ...style }}>
      <Select2
        defaultValue={options?.[0]?.value}
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

export default React.memo(AssetSelect);
