// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { FullscreenNftModalProps } from '../utils/types';

import { Close as CloseIcon } from '@mui/icons-material';
import { Box, IconButton, Modal, useTheme } from '@mui/material';
import React, { useCallback, useEffect } from 'react';

export default function ItemFullscreenModal ({ image, onClose, open }: FullscreenNftModalProps): React.ReactElement {
  const theme = useTheme();

  // Listen to fullscreen change events to track exit from fullscreen mode
  const handleFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement) {
      onClose(); // Close the modal when exiting fullscreen
    }
  }, [onClose]);

  // Listen for the Escape key to close the modal
  useEffect(() => {
    if (open) {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [open, handleFullscreenChange]);

  return (
    <Modal onClose={onClose} open={open} slotProps={{ backdrop: { style: { backgroundColor: theme.palette.background.paper } } }} sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ maxHeight: '90vh', maxWidth: '90vw', position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <img
          alt='NFT Fullscreen'
          src={image || ''}
          style={{ border: '2px solid', borderColor: theme.palette.primary.main, maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain' }}
        />
      </Box>
    </Modal>
  );
}
