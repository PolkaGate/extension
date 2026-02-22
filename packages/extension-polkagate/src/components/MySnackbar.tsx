// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-no-bind */

import { Box, keyframes, Slide, Snackbar, Typography, useTheme } from '@mui/material';
import { CloseCircle } from 'iconsax-react';
import React, { useEffect } from 'react';

import { check } from '@polkadot/extension-polkagate/src/assets/gif/index';

interface Props {
  direction?: 'up' | 'left' | 'right' | 'down' | undefined;
  anchorOriginHorizontal?: 'center' | 'right' | 'left';
  text: string;
  open: boolean;
  isError?: boolean;
  onClose: () => void;
}

// Keyframes animation for smooth progress without re-renders
const progressAnimation = keyframes`
  from { width: 0%; }
  to { width: 100%; }
`;

const SNACK_BAR_VISIBILITY_DURATION = 2000;

/**
 * A custom Snackbar component that displays a message with a gradient background
 * and a progress bar indicating its visibility duration.
 *
 * @component
 * @param {string} text - The message to display in the Snackbar.
 * @param {boolean} open - Controls the visibility of the Snackbar.
 * @param {() => void} onClose - Callback function to close the Snackbar.
 * @returns {JSX.Element} The rendered Snackbar component.
 */
const MySnackbar = ({ anchorOriginHorizontal = 'center', direction = 'up', isError, onClose, open, text }: Props) => {
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
      TransitionComponent={(props) => <Slide {...props} direction={direction} />}
      anchorOrigin={{ horizontal: anchorOriginHorizontal, vertical: 'top' }}
      open={open}
      sx={{ pointerEvents: 'none', top: '90px !important' }}
    >
      <Box
        sx={{
          alignItems: 'center',
          background: isError ? 'linear-gradient(262.56deg, #B1004D 0%, #DC45A0 45%, #B1004D 100%)' : 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
          borderRadius: '12px',
          boxShadow: 3,
          color: '#fff',
          columnGap: '5px',
          display: 'flex',
          height: '52px',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          pointerEvents: 'auto',
          py: 1.5,
          textAlign: 'center',
          width: '330px'
        }}
      >
        {
          isError
            ? <CloseCircle color='#EAEBF1' size='24' />
            : <Box
              component='img'
              src={check as string}
              sx={{ height: '28px', left: '20px', position: 'absolute', width: '28px' }}
            />
        }
        <Typography color={theme.palette.text.primary} variant='B-2'>
          {text}
        </Typography>
        <Box
          sx={{
            backgroundColor: '#674394',
            bottom: '1px',
            height: '3px',
            position: 'absolute',
            width: '100%'
          }}
        >
          <Box
            sx={{
              animation: `${progressAnimation} 2s linear`,
              backgroundColor: '#EAEBF1',
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
