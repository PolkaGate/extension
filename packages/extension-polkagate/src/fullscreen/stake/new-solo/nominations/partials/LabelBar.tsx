// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { alpha, Grid, IconButton, Stack, Typography } from '@mui/material';
import { ArrowDown2 } from 'iconsax-react';
import React, { useCallback } from 'react';

interface Props {
  Icon: Icon;
  color: string;
  count: number | undefined;
  description?: string
  isCollapsed?: boolean;
  label: string | undefined;
  setCollapse?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function LabelBar({ Icon, color, count, description, isCollapsed, label, setCollapse }: Props): React.ReactElement {
  const onClick = useCallback(() => {
    setCollapse?.((pre) => !pre);
  }, [setCollapse]);

  return (
    <Grid alignItems='center' container item justifyContent='space-between' onClick={onClick} sx={{ bgcolor: '#05091C', borderRadius: '14px', cursor: 'pointer', lineHeight: '45px', m: '10px 0 2px', p: '0  6px 0 13px', width: '99%' }}>
      <Stack alignItems='center' columnGap='4px' direction='row'>
        <Icon color={color} size='18' variant='Bulk' />
        <Typography sx={{ color: 'text.primary' }} variant='B-2'>
          {label}
        </Typography>
        {
          description &&
          <Typography sx={{ bgcolor: alpha(color, 0.15), borderRadius: '6px', color, lineHeight: '19px', mx: '5px', px: '5px' }} variant='B-5'>
            {description}
          </Typography>
        }
        <Typography sx={{ bgcolor: alpha(color, 0.15), borderRadius: '1024px', color, lineHeight: '19px', minWidth: '23px' }} variant='B-1'>
          {count || 0}
        </Typography>
      </Stack>
      <IconButton sx={{ '&:hover': { bgcolor: '#8E6ACF' }, bgcolor: '#AA83DC', borderRadius: '8px', height: '36px', width: '34px' }}>
        <ArrowDown2
          color='#05091C'
          size='14' style={{
            transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }} variant='Bold'
        />
      </IconButton>
    </Grid>
  );
}
