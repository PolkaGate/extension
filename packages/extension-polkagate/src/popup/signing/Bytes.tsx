// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { isAscii, u8aToString, u8aUnwrapBytes } from '@polkadot/util';

import useTranslation from '../../hooks/useTranslation';

interface Props {
  bytes: string;
  url: string;
}

export default function Bytes({ bytes, url }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const text = useMemo(
    () => isAscii(bytes)
      ? u8aToString(u8aUnwrapBytes(bytes))
      : bytes,
    [bytes]
  );

  const firstSlash = url.indexOf('/');
  const secondSlash = url.indexOf('/', firstSlash + 1);
  const thirdSlash = url.indexOf('/', secondSlash + 1);
  const final = url.substring(0, thirdSlash);

  return (
    <Grid container fontSize='16px' sx={{ '> div:last-child': { border: 'none' }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', m: '15px auto', width: '92%' }}>
      <Grid alignItems='center' container item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light', minHeight: '36px', px: '8px' }}>
        <Typography fontWeight={300} width='17%'>
          {t<string>('from')}
        </Typography>
        <Typography fontWeight={400} overflow='hidden' whiteSpace='nowrap' textOverflow='ellipsis' textAlign='right' width='83%'>
          {final}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light', minHeight: '36px', px: '8px' }}>
        <Typography fontWeight={300} width='17%'>
          {t<string>('bytes')}
        </Typography>
        <Typography fontWeight={400} overflow='hidden' whiteSpace='nowrap' textOverflow='ellipsis' textAlign='right' width='83%'>
          {text}
        </Typography>
      </Grid>
    </Grid>
  );
}
