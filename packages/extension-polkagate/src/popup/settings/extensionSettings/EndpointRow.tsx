// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography, useTheme } from '@mui/material';
import React, {  } from 'react';

import Radio from '../../../components/Radio';
import { useTranslation } from '../../../hooks';
import DotIndicator from './components/DotIndicator';

interface EndpointRowProps {
  isFirst: boolean;
  isLast: boolean;
  checked: boolean;
  disabled?: boolean;
  name: string;
  value: string;
  delay: number | null | undefined;
  onChangeEndpoint: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function EndpointRow({ checked, delay, disabled = false, isFirst, isLast, name, onChangeEndpoint, value }: EndpointRowProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const rowBg = isDark ? '#05091C' : '#FFFFFF';
  const rowBorderColor = isDark ? '#1B133C' : '#DDE3F4';
  const endpointColor = isDark ? '#674394' : theme.palette.text.secondary;
  const nodesLabelColor = isDark ? '#7956A5' : theme.palette.primary.main;

  return (
    <Grid alignItems='start' container direction='column' item key={value} py='5px' sx={{ bgcolor: rowBg, border: '1px solid', borderColor: rowBorderColor, borderRadius: isFirst ? '14px 14px 0 0' : isLast ? '0 0 14px 14px' : 0, flexWrap: 'nowrap', height: isFirst ? '100px' : '73px', mt: '2px', px: '10px' }}>
      {
        isFirst &&
        <Typography color={nodesLabelColor} fontFamily='Inter' fontSize='11px' fontWeight={600} sx={{ p: '8px' }}>
          {t('NODES')}
        </Typography>
      }
      <Stack alignItems='center' columnGap='10px' direction='row'>
        <Radio
          checked={checked}
          columnGap='5px'
          label={name}
          onChange={onChangeEndpoint}
          props={{ disabled }}
          value={value}
        />
        <DotIndicator delay={delay} />
      </Stack>
      <Grid item sx={{ pl: '10px' }}>
        <Typography color={endpointColor} sx={{ display: 'block', overflow: 'auto', textAlign: 'left', textWrapMode: 'nowrap', width: '300px' }} variant='B-5'>
          {value}
        </Typography>
      </Grid>
    </Grid>
  );
}

export default React.memo(EndpointRow);
