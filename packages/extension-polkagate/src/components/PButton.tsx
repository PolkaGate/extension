// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Grid, useTheme } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React from 'react';

interface Props {
  text: string;
  _variant?: 'text' | 'contained' | 'outlined';
  _onClick: React.MouseEventHandler<HTMLButtonElement>;
  _mt?: string;
  disabled?: boolean;
  _fontSize?: string;
  _isBusy?: boolean;
  _ml?: number;
  _width?: number;
  startIcon?: React.ReactNode;
}

function PButton({ _fontSize = '16px', _isBusy, _ml = 6, _mt, _onClick, _variant = 'contained', _width = 88, disabled = false, startIcon, text }: Props): React.ReactElement<Props> {
  const theme = useTheme();

  return (
    <>
      {_isBusy
        ? <Grid
          alignItems='center'
          container
          justifyContent='center'
          sx={{
            border: '1px solid',
            borderColor: 'secondary.main',
            borderRadius: '5px',
            bottom: !_mt ? '25px' : 0,
            backgroundColor: 'secondary.main',
            fontSize: _fontSize,
            fontWeight: 400,
            height: '36px',
            ml: '6%',
            mt: _mt ?? 0,
            position: !_mt ? 'absolute' : 'inherit',
            textTransform: 'none',
            width: '88%'
          }}>
          <Circle
            color='white'
            scaleEnd={0.7}
            scaleStart={0.4}
            size={25} />
        </Grid>
        : <Button
          disabled={disabled}
          onClick={_onClick}
          startIcon={startIcon}
          sx={{
            "&:disabled": { backgroundColor: '#4b4b4b' },
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
