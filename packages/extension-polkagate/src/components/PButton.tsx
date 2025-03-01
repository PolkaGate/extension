// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Grid, useTheme } from '@mui/material';
// @ts-ignore
import { Circle } from 'better-react-spinkit';
import React from 'react';

interface Props {
  disabled?: boolean;
  _fontSize?: string;
  _isBusy?: boolean;
  left?: string;
  _ml?: number;
  _mt?: string;
  _onClick: React.MouseEventHandler<HTMLButtonElement>;
  startIcon?: React.ReactNode;
  text: string;
  _variant?: 'text' | 'contained' | 'outlined';
  _width?: number | string;
}

function PButton({ _fontSize = '16px', _isBusy, _ml = 6, _mt, _onClick, _variant = 'contained', _width = 88, disabled = false, left, startIcon, text }: Props): React.ReactElement<Props> {
  const theme = useTheme();

  return (
    <>
      {_isBusy
        ? <Grid
          alignItems='center'
          container
          justifyContent='center'
          sx={{
            backgroundColor: 'secondary.main',
            border: '1px solid',
            borderColor: 'secondary.main',
            borderRadius: '5px',
            bottom: !_mt ? '25px' : 0,
            fontSize: _fontSize,
            fontWeight: 400,
            height: '36px',
            left,
            ml: `${_ml}%`,
            mt: _mt ?? 0,
            position: !_mt ? 'absolute' : 'inherit',
            textTransform: 'none',
            width: '88%'
          }}>
          <Circle
            color='white'
            scaleEnd={0.7}
            scaleStart={0.4}
            size={25}
          />
        </Grid>
        : <Button
          disabled={disabled}
          onClick={_onClick}
          startIcon={startIcon}
          sx={{
            '&:disabled': { backgroundColor: '#4b4b4b' },
            borderColor: 'secondary.main',
            borderRadius: '5px',
            bottom: !_mt ? '25px' : 0,
            color: _variant === 'text'
              ? 'secondary.light'
              : theme.palette.mode === 'dark'
                ? 'text.primary'
                : _variant === 'contained'
                  ? 'text.secondary'
                  : 'text.primary',
            fontSize: _fontSize,
            fontWeight: 400,
            height: '36px',
            left,
            ml: `${_ml}%`,
            mt: _mt ?? 0,
            position: !_mt ? 'absolute' : 'inherit',
            textDecoration: _variant === 'text' ? 'underline' : 'none',
            textTransform: 'none',
            width: `${_width}%`
          }}
          variant={_variant}
        >
          {text}
        </Button>
      }
    </>
  );
}

export default (PButton);
