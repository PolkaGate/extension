// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Container, useTheme } from '@mui/material';
import React from 'react';

import { GradientButton, NeonButton } from '.';

interface Props {
  arrow?: boolean;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
  primaryBtnText: string;
  secondaryBtnText: string;
  disabled?: boolean;
}

function DecisionButtons ({ arrow = false, disabled, onPrimaryClick, onSecondaryClick, primaryBtnText, secondaryBtnText }: Props): React.ReactElement {
  const theme = useTheme();

  return (
    <Container disableGutters sx={{ alignItems: 'center', columnGap: '5px', display: 'flex', justifyContent: 'space-between' }}>
      <NeonButton
        contentPlacement='center'
        onClick={onSecondaryClick}
        style={{ height: '44px', width: '30%' }}
        text={secondaryBtnText}
      />
      <GradientButton
        disabled={disabled}
        endIconNode={arrow
          ? <ArrowForwardIosRoundedIcon sx={{ color: 'text.primary', fontSize: '13px', stroke: `${theme.palette.text.primary}`, strokeWidth: 1.1, zIndex: 10 }} />
          : undefined}
        onClick={onPrimaryClick}
        style={{ height: '48px', width: '70%' }}
        text={primaryBtnText}
      />
    </Container>
  );
}

export default DecisionButtons;
