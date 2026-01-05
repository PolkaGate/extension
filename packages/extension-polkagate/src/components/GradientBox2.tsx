// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import { Box, Container, type SxProps, type Theme } from '@mui/material';
import React from 'react';

import { GradientBorder, RedGradient } from '../style';

interface Props {
  children?: React.ReactNode;
  style?: SxProps<Theme>;
  noGradient?: boolean;
  withGradientTopBorder?: boolean;
}

/**
 * A container with optional gradient top border and background styling.
 * Displays children content inside a styled box with optional gradient effects.
 *
 * @param {React.ReactNode} [children] - The content to display inside the box.
 * @param {SxProps<Theme>} [style] - Optional style overrides for the container.
 * @param {boolean} [noGradient] - Whether to disable the gradient background.
 * @param {boolean} [withGradientTopBorder] - Whether to display the gradient top border.
 *
 * @returns {React.ReactElement} The rendered container component with optional gradient effects.
 */
function GradientBox2({ children, noGradient = false, style, withGradientTopBorder = true }: Props) {
  return (
    <Container
      disableGutters sx={{
        bgcolor: '#120D27',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '32px',
        boxShadow: '0px 0px 24px 8px #4E2B7259 inset',
        height: 'fit-content',
        overflow: 'hidden',
        position: 'relative',
        ...style
      }}
    >
      {withGradientTopBorder &&
        <GradientBorder style={{ top: '-2px' }} />
      }
      {!noGradient &&
        <RedGradient style={{ top: '-100px' }} />
      }
      <Box position='relative' zIndex={1}>
        {children}
      </Box>
    </Container>
  );
}

export default React.memo(GradientBox2);
