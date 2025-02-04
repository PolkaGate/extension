// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Container, type SxProps, type Theme, useTheme } from '@mui/material';
import React from 'react';

import { ActionButton, GradientButton, GradientDivider, NeonButton } from '.';

interface Props {
  arrow?: boolean;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
  primaryBtnText: string;
  secondaryBtnText: string;
  disabled?: boolean;
  cancelButton?: boolean;
  style?: SxProps<Theme>;
  divider?: boolean;
  flexibleWidth?: boolean;
}

function DecisionButtons ({ arrow = false, cancelButton, disabled, divider = false, flexibleWidth, onPrimaryClick, onSecondaryClick, primaryBtnText, secondaryBtnText, style }: Props): React.ReactElement {
  const theme = useTheme();

  return (
    <Container disableGutters sx={{ alignItems: 'center', columnGap: '5px', display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1, ...style }}>
      {cancelButton
        ? <ActionButton
          contentPlacement='center'
          onClick={onSecondaryClick}
          style={{ height: '44px', width: flexibleWidth ? 'fit-content' : '30%' }}
          text={secondaryBtnText}
        />
        : <NeonButton
          contentPlacement='center'
          onClick={onSecondaryClick}
          style={{ height: '44px', width: flexibleWidth ? 'fit-content' : '30%' }}
          text={secondaryBtnText}
        />
      }
      {divider &&
        <GradientDivider orientation='vertical' style={{ height: '90%', mx: '8px' }} />
      }
      <GradientButton
        disabled={disabled}
        endIconNode={arrow
          ? <ArrowForwardIosRoundedIcon sx={{ color: 'text.primary', fontSize: '13px', stroke: `${theme.palette.text.primary}`, strokeWidth: 1.1, zIndex: 10 }} />
          : undefined}
        onClick={onPrimaryClick}
        style={{ flex: flexibleWidth ? 1 : 'none', height: '48px', width: flexibleWidth ? 'auto' : '70%' }}
        text={primaryBtnText}
      />
    </Container>
  );
}

export default DecisionButtons;
