// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, type SxProps, type Theme, useTheme } from '@mui/material';
import React from 'react';

import { loader } from '@polkadot/extension-polkagate/src/assets/gif/index';

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
      background: 'linear-gradient(262.56deg, rgba(0, 148, 255, 0.3) 0%, rgba(89, 106, 255, 0.3) 45%, rgba(0, 148, 255, 0.3) 100%)',
      cursor: 'default'
    },
    '&:hover': {
      background: 'linear-gradient(262.56deg, #007CE0 0%, #405CFF 45%, #007CE0 100%)',
      transition: 'background 250ms ease-out'
    },
    background:
      isButtonDisabled
        ? 'linear-gradient(262.56deg, rgba(0, 148, 255, 0.3) 0%, rgba(89, 106, 255, 0.3) 45%, rgba(0, 148, 255, 0.3) 100%)'
        : 'linear-gradient(262.56deg, #0094ff 0%, #596aff 45%, #0094ff 100%)',
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
      {isBusy
        ? <Box
          component='img'
          src={loader as string}
          sx={{
            animation: 'spin 1.5s linear infinite',
            height: '42px',
            zIndex: 2,
            '@keyframes spin': {
              '0%': {
                transform: 'rotate(0deg)'
              },
              '100%': {
                transform: 'rotate(360deg)'
              }
            }
          }}
        />
        : <span style={ButtonFontStyle}>
          {text}
        </span>
      }
    </Button>
  );
}
