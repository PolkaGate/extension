// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
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

  return (
    <Grid alignItems='start' container direction='column' item key={value} py='5px' sx={{ bgcolor: '#05091C', borderRadius: isFirst ? '14px 14px 0 0' : isLast ? '0 0 14px 14px' : 0, flexWrap: 'nowrap', height: isFirst ? '100px' : '73px', mt: '2px', px: '10px' }}>
      {
        isFirst &&
        <Typography color='#7956A5' fontFamily='Inter' fontSize='11px' fontWeight={600} sx={{ p: '8px' }}>
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
        <Typography color='#674394' sx={{ display: 'block', overflow: 'auto', textAlign: 'left', textWrapMode: 'nowrap', width: '300px' }} variant='B-5'>
          {value}
        </Typography>
      </Grid>
    </Grid>
  );
}

export default React.memo(EndpointRow);
