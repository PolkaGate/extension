// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Close as CloseIcon } from '@mui/icons-material';
import { Box, IconButton, Modal } from '@mui/material';
import React from 'react';

interface FullscreenNftModalProps {
  image: string | null | undefined;
  onClose: () => void;
  open: boolean;
}

export default function FullscreenNftModal ({ image, onClose, open }: FullscreenNftModalProps): React.ReactElement {
  return (
    <Modal onClose={onClose} open={open} sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ maxHeight: '90vh', maxWidth: '90vw', position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.7)'
            },
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'white',
            position: 'absolute',
            right: 8,
            top: 8
          }}
        >
          <CloseIcon />
        </IconButton>
        <img
          alt='NFT Fullscreen'
          src={image || ''}
          style={{
            maxHeight: '90vh',
            maxWidth: '100%',
            objectFit: 'contain'
          }}
        />
      </Box>
    </Modal>
  );
}
