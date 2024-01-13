// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, SxProps, Theme } from '@mui/material';
import React, { useCallback } from 'react';

import { useBlockInterval, useConvictionOptions, useTranslation } from '../hooks';
import { Select } from '.';

interface Props {
  address: string | undefined;
  children?: React.ReactElement;
  conviction: number | undefined;
  setConviction: React.Dispatch<React.SetStateAction<number | undefined>>;
  style?: SxProps<Theme> | undefined;
}

export default function Convictions({ address, children, conviction, setConviction, style }: Props): React.ReactElement {
  const { t } = useTranslation();
  const blockTime = useBlockInterval(address);
  const convictionOptions = useConvictionOptions(address, blockTime, t);

  const onChangeConviction = useCallback((conviction: number): void => {
    setConviction(conviction);
  }, [setConviction]);

  return (
    <Grid alignContent='flex-start' alignItems='flex-start' container justifyContent='center' sx={{ '> div div div': { fontSize: '16px', fontWeight: 400 }, position: 'relative', ...style }}>
      <Select
        defaultValue={convictionOptions?.[0]?.value}
        isDisabled={!convictionOptions}
        label={t<string>('Vote Multiplier')}
        onChange={onChangeConviction}
        options={convictionOptions || []}
        value={conviction || convictionOptions?.[0]?.value}
      />
      {children}
    </Grid>
  );
}
