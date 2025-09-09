// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface Options {
  Icon?: Icon;
  isLine?: boolean;
  pathname?: string;
  text?: string;
  value?: string | number | (() => void);
}

interface Props {
  option: Options
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function DropMenuRow ({ option, setOpen }: Props) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const { Icon, pathname, text, value } = option;

  const onClick = useCallback(async () => {
    setOpen(false);
    typeof value === 'function'
      ? value()
      : await navigate(value as string, { state: { pathname } });
  }, [navigate, pathname, setOpen, value]);

  return (
    <Grid
      container
      item
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        '&:hover': { background: '#6743944D' },
        alignItems: 'center',
        background: 'transparent',
        borderRadius: '8px',
        columnGap: '5px',
        cursor: 'pointer',
        minWidth: '150px',
        padding: '10px 8px'
      }}
    >
      <Grid alignItems='center' container item sx={{ columnGap: '7px', flexWrap: 'nowrap' }} xs>
        {Icon &&
          <Icon size='18' style={{ color: hovered ? '#FF4FB9' : '#AA83DC' }} variant='Bulk' />
        }
        <Typography color='text.primary' sx={{ textWrap: 'nowrap' }} variant='B-2'>
          {text}
        </Typography>
      </Grid>
    </Grid>
  );
}

export default React.memo(DropMenuRow);
