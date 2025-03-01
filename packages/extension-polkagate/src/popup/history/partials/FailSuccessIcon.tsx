// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Container, Typography, useTheme } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import { useTranslation } from '../../../hooks';

interface Props {
  success: boolean;
  showLabel?: boolean;
  size?: number;
  style?: React.CSSProperties;
}

export function AnimatedCheckIcon({ fontSize, initial = true, isVisible = true }: { initial?: boolean; isVisible?: boolean, fontSize: string }) {
  const theme = useTheme();

  const iconStyles = {
    bgcolor: theme.palette.success.main,
    borderRadius: '50%',
    color: 'white',
    fontSize,
    stroke: 'white'
  };

  return (
    <AnimatePresence initial={initial}>
      {isVisible && (
        <svg
          fill='none'
          stroke={iconStyles.stroke}
          strokeWidth={1.5}
          style={{
            alignItems: 'center',
            backgroundColor: iconStyles.bgcolor,
            borderRadius: iconStyles.borderRadius,
            display: 'flex',
            height: iconStyles.fontSize,
            justifyContent: 'center',
            justifySelf: 'center',
            width: iconStyles.fontSize
          }}
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <motion.path
            animate={{ pathLength: 1 }}
            d='M4.5 12.75l6 6 9-13.5'
            exit={{ pathLength: 0 }}
            initial={{ pathLength: 0 }}
            strokeLinecap='round'
            strokeLinejoin='round'
            transition={{
              damping: 15,
              duration: 1.2,
              stiffness: 70,
              type: 'spring'
            }}
          />
        </svg>
      )}
    </AnimatePresence>
  );
}

// @ts-ignore
export default function FailSuccessIcon({ showLabel = true, style = { fontSize: '54px', mt: '20px' }, success }: Props) {
  const { t } = useTranslation();

  return (
    <Container
      disableGutters
      sx={{ height: '105px', ...style }}
    >
      {
        success
          ? <AnimatedCheckIcon
            fontSize={style.fontSize as string}
          />
          : <CloseIcon
            sx={{
              bgcolor: 'warning.main',
              borderRadius: '50%',
              color: '#fff',
              fontSize: style.fontSize,
              stroke: 'white'
            }}
          />
      }
      {showLabel &&
        <Typography
          fontSize='16px'
          fontWeight={500}
        >
          {success ? t('Completed') : t('Failed')}
        </Typography>
      }
    </Container>
  );
}
