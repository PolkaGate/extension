// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, SxProps, Typography } from '@mui/material';
import { Theme } from '@mui/material/styles';
import React, { useCallback, useState } from 'react';

import Checkmark from '../assets/checkmark.svg';

interface Props {
  checked: boolean;
  label: string;
  onChange?: (checked: boolean) => void;
  onClick?: () => void;
  theme: Theme;
  style?: SxProps<Theme> | undefined
  height?: number;
  width?: number;
}

export default function Checkbox({ checked = false, height = 22, label, theme, onChange, onClick, style, width = 22 }: Props): React.ReactElement<Props> {
  const [getChecked, setChecked] = useState<Boolean>(checked);

  const _onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onChange && onChange(event.target.checked),
    [onChange]
  );

  const _onClick = useCallback(
    () => {
      onClick && onClick();
      setChecked(!getChecked);
    },
    [getChecked, onClick]
  );

  return (
    <Grid
      alignItems='center'
      container
      position='relative'
      sx={{ ...style }}
    >
      <Grid
        item
        display='inline-flex'
        lineHeight='25px'
      >
        <Grid
          sx={{
            border: '1px solid',
            borderColor: 'secondary.light',
            borderRadius: '5px',
            height,
            m: 'auto',
            mr: label.length ? '7px' : 0,
            width
          }}
        >
          <img
            src={Checkmark}
            style={{
              height: height - 2,
              width: width - 3,
              visibility: getChecked ? 'visible' : 'hidden'
            }}
          />
        </Grid>
        <Typography
          fontSize='inherit'
          textAlign='left'
        >
          {label}
        </Typography>
      </Grid>
      <input
        checked={getChecked}
        onChange={_onChange}
        onClick={_onClick}
        style={{
          cursor: 'pointer',
          height: '100%',
          margin: 0,
          opacity: 0,
          position: 'absolute',
          width: '100%'
        }}
        type='checkbox'
      />
    </Grid>
  );
}
