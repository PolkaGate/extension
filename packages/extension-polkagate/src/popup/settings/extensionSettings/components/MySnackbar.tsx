// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-no-bind */

import { Box, keyframes, Slide, Snackbar, Typography, useTheme } from '@mui/material';
import React, { useEffect } from 'react';

interface Props {
  text: string;
  open: boolean;
  onClose: () => void;
}

// Keyframes animation for smooth progress without re-renders
const progressAnimation = keyframes`
  from { width: 0%; }
  to { width: 100%; }
`;

const SNACK_BAR_VISIBILITY_DURATION = 2000;

const MySnackbar = ({ onClose, open, text }: Props) => {
  const theme = useTheme();

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        onClose();
      }, SNACK_BAR_VISIBILITY_DURATION);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [open, onClose]);

  return (
    <Snackbar
      TransitionComponent={(props) => <Slide {...props} direction='up' />} 
      anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
      open={open}
      sx={{ top: '90px !important' }}
    >
      <Box
        sx={{
          background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
          borderRadius: '12px',
          boxShadow: 3,
          color: '#fff',
          height: '52px',
          position: 'relative',
          px: 2,
          py: 1.5,
          textAlign: 'center',
          width: '330px'
        }}
      >
        <Typography color={ theme.palette.text.primary} variant='B-2'>
          {text}
        </Typography>
        <Box
          sx={{
            backgroundColor: '#674394',
            bottom: '1px',
            height: '3px',
            left: '4px',
            position: 'absolute',
            width: '97%'
          }}
        >
          <Box
            sx={{
              animation: `${progressAnimation} 2s linear`,
              backgroundColor: '#EAEBF1',
              borderBottomLeftRadius: '20%',
              borderBottomRightRadius: '20%',
              height: '100%',
              width: '100%'
            }}
          />
        </Box>
      </Box>
    </Snackbar>
  );
};

export default React.memo(MySnackbar);
