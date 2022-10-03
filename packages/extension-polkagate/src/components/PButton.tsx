// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@mui/material';
import React, { useEffect, useState } from 'react';

interface Props {
  text: string;
  _variant?: 'text' | 'contained' | 'outlined';
  _onClick: React.MouseEventHandler<HTMLButtonElement>;
  _mt: string;
  disabled?: boolean;
}

function PButton({ _mt, _onClick, _variant = 'contained', disabled = false, text }: Props): React.ReactElement<Props> {

  return (
    <Button
      disabled={disabled}
      onClick={_onClick}
      sx={{
        borderColor: 'secondary.main',
        borderRadius: '5px',
        color: _variant === 'contained' ? 'text.secondary' : 'text.primary',
        fontSize: '16px',
        fontWeight: 300,
        height: '36px',
        ml: '6%',
        mt: _mt,
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
