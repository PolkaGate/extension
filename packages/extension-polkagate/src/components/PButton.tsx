// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, useTheme } from '@mui/material';
import React from 'react';

interface Props {
  text: string;
  _variant?: 'text' | 'contained' | 'outlined';
  _onClick: React.MouseEventHandler<HTMLButtonElement>;
  _mt: string;
  disabled?: boolean;
  _fontSize?: string;
}

function PButton({ _fontSize = '16px', _mt, _onClick, _variant = 'contained', disabled = false, text }: Props): React.ReactElement<Props> {
  const theme = useTheme();

  return (
    <Button
      disabled={disabled}
      onClick={_onClick}
      sx={{
        borderColor: 'secondary.main',
        borderRadius: '5px',
        bottom: !_mt ? '25px' : 0,
        color: theme.palette.mode === 'dark' ? 'text.primary' : _variant === 'contained' ? 'text.secondary' : 'text.primary',
        fontSize: _fontSize,
        fontWeight: 400,
        height: '36px',
        ml: '6%',
        mt: _mt ?? 0,
        position: !_mt ? 'absolute' : 'inherit',
        textTransform: 'none',
        width: '88%'
      }}
      variant={_variant}
    >
      {text}
    </Button>
  );
}

export default (PButton);
