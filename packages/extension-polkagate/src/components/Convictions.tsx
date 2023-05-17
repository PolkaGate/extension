// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React, { useCallback } from 'react';

import { useApi, useBlockInterval, useConvictionOptions, useTranslation } from '../hooks';
import { Select } from '.';

interface Props {
  address: string | undefined;
  children?: React.ReactElement;
  conviction: number | undefined;
  setConviction: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export default function Convictions({ address, children, conviction, setConviction }: Props): React.ReactElement {
  const { t } = useTranslation();
  const blockTime = useBlockInterval(address);
  const convictionOptions = useConvictionOptions(address, blockTime, t);

  const onChangeConviction = useCallback((conviction: number): void => {
    setConviction(conviction);
  }, [setConviction]);

  return (
    <Grid alignContent='flex-start' alignItems='flex-start' container justifyContent='center' sx={{ position: 'relative' }}>
      {/* {convictionOptions && */}
      <>
        <Select
          _mt='15px'
          defaultValue={convictionOptions?.[0]?.value}
          isDisabled={!convictionOptions}
          label={t<string>('Vote Multiplier')}
          onChange={onChangeConviction}
          options={convictionOptions || []}
          value={conviction || convictionOptions?.[0]?.value}
        />
        {children}
      </>
      {/* } */}
    </Grid>
  );
}
