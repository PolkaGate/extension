// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, SxProps, Theme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import { useAssets, useTokens } from '@polkadot/extension-polkagate/src/hooks';

import Select2 from '../../../components/Select2';

interface Props {
  address: string | undefined;
  onChange: (value: string | number) => void;
  label: string;
  style: SxProps<Theme> | undefined;
  assetId: number | undefined;
  setAssetId: React.Dispatch<React.SetStateAction<number | undefined>>
}

function ChangeAssets ({ address, assetId, label, onChange, setAssetId, style }: Props) {
  const tokens = useTokens(address);
  const assets = useAssets(address);
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

export default React.memo(ChangeAssets);
