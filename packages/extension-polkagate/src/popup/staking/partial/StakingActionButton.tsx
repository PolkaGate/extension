// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, type SxProps, type Theme, useTheme } from '@mui/material';
import React from 'react';

interface Props {
  startIcon?: React.ReactNode;
  disabled?: boolean;
  isBusy?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  style?: SxProps<Theme> | undefined;
  text?: string;
}

export default function StakingActionButton ({ disabled, isBusy, onClick, startIcon, style, text }: Props): React.ReactElement<Props> {
  const theme = useTheme();

  const isButtonDisabled = disabled || isBusy;

  const ButtonFontStyle = {
    ...theme.typography['B-2'],
    color: isButtonDisabled ? '#EAEBF14D' : theme.palette.text.primary,
    justifyContent: 'center',
    textTransform: 'none'
  } as React.CSSProperties;

  const GeneralButtonStyle = {
    '&:disabled': {
      background: 'rgba(89, 106, 255, 0.3)',
      //   background: 'linear-gradient(262.56deg, rgba(0, 148, 255, 0.3) 0%, rgba(89, 106, 255, 0.3) 45%, rgba(0, 148, 255, 0.3) 100%)',
      cursor: 'default'
    },
    '&:hover': {
      background: '#1E5FC0',
      transition: 'all 250ms ease-out'
    },
    background:
      !isButtonDisabled
        ? '#596AFF'
        // ? 'linear-gradient(262.56deg, #0094FF 0%, #596AFF 45%, #0094FF 100%)'
        : 'linear-gradient(262.56deg, rgba(0, 148, 255, 0.3) 0%, rgba(89, 106, 255, 0.3) 45%, rgba(0, 148, 255, 0.3) 100%)',
    borderRadius: '12px',
    boxShadow: 'unset',
    height: '44px',
    justifyContent: 'flex-start',
    padding: '6px 24px',
    transition: 'all 250ms ease-out',
    width: '345px',
    ...ButtonFontStyle
  };

  const StartIconStyle = {
    '& .MuiButton-startIcon': {
      marginLeft: 0,
      marginRight: '16px'
    },
    '& .MuiButton-startIcon svg': {
      color: '#BEAAD8'
    }
  };

  return (
    <Button
      disabled={isButtonDisabled}
      onClick={onClick}
      startIcon={startIcon}
      sx={{ ...GeneralButtonStyle, ...StartIconStyle, ...style }}
      variant='contained'
    >
      <span style={ButtonFontStyle}>
        {text}
      </span>
    </Button>
  );
}
