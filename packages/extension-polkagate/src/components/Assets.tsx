// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, SxProps, Theme } from '@mui/material';
import React, { useMemo } from 'react';

import { useAssets, useTokens } from '@polkadot/extension-polkagate/src/hooks';

import Select2 from './Select2';

interface Props {
  address: string | null | undefined;
  onChange: (value: string | number) => void;
  label: string;
  style: SxProps<Theme> | undefined;
}

function Assets({ address, label, onChange, style }: Props) {
  const tokens = useTokens(address);
  const assets = useAssets(address);
  const options = useMemo(() => (tokens || []).concat(assets || []), [assets, tokens]);

  return (
    <Grid alignItems='flex-end' container justifyContent='space-between' sx={{ ...style }}>
      <Select2
        defaultValue={options?.[0]?.value}
        // isDisabled={!address || !assets}
        label={label}
        onChange={onChange}
        options={options}
        showIcons={false}
      />
    </Grid>
  );
}

export default React.memo(Assets);
