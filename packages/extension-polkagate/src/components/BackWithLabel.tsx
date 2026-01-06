// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, type SxProps, type Theme, Typography } from '@mui/material';
import { ArrowCircleLeft } from 'iconsax-react';
import React, { useMemo, useRef } from 'react';

import { useIsBlueish, useIsHovered, useTranslation } from '../hooks';

export interface StepCounterType { currentStep: number; totalSteps: number }

export const StepCounter = ({ stepCounter }: { stepCounter: StepCounterType }) => {
  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', gap: '4px', justifyContent: 'center', m: 0, width: 'fit-content' }}>
      {Array.from({ length: stepCounter.totalSteps }).map((_, index) => {
        const isActive = index + 1 === stepCounter.currentStep;

        return (
          <div
            key={index}
            style={{ backgroundColor: isActive ? '#596AFF' : '#3E4165', borderRadius: '999px', height: '10px', transform: isActive ? 'scale(1.263)' : 'scale(0.758)', transition: 'transform 250ms ease', width: '10px' }}
          />
        );
      })}
    </Container>
  );
};

interface DynamicBackButtonProps {
  text?: string;
  content?: React.ReactNode;
  onClick: () => void;
  style?: SxProps<Theme>;
  stepCounter?: StepCounterType;
}

function BackWithLabel({ content, onClick, stepCounter, style, text }: DynamicBackButtonProps) {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const hovered = useIsHovered(containerRef);
  const isBlueish = useIsBlueish();

  const renderContent = useMemo(() => {
    if (content) {
      return content;
    } else {
      return (
        <Typography sx={{ fontFamily: 'OdibeeSans', fontSize: '24px', fontWeight: '400', lineHeight: '26px', textTransform: 'uppercase' }}>
          {text ?? t('Back')}
        </Typography>
      );
    }
  }, [content, t, text]);

  return (
    <Box
      alignItems='center'
      display='flex'
      onClick={onClick}
      ref={containerRef}
      sx={{ cursor: 'pointer', justifyContent: 'space-between', px: '15px', py: '8px', width: '100%', ...style }}
    >
      <Grid container item sx={{ alignItems: 'center', columnGap: '6px', display: 'flex', flexDirection: 'row', width: 'fit-content' }}>
        <ArrowCircleLeft color={isBlueish ? '#809ACB' : '#FF4FB9'} size='24' variant={hovered ? 'Bold' : 'Bulk'} />
        {renderContent}
      </Grid>
      {stepCounter && <StepCounter stepCounter={stepCounter} />}
    </Box>
  );
}

export default BackWithLabel;
