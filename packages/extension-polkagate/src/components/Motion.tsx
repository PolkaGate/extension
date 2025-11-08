// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MotionStyle } from 'framer-motion';

import { motion } from 'framer-motion';
import * as React from 'react';

const variants = {
  fade: {
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
    initial: { opacity: 0 }
  },
  flip: {
    animate: { opacity: 1, rotateY: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, rotateY: -90, transition: { duration: 0.5 } },
    initial: { opacity: 0, rotateY: 90 }
  },
  slide: {
    animate: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' }, x: 0 },
    exit: { opacity: 0, transition: { duration: 0.3, ease: 'easeIn' }, x: '-100%' },
    initial: { opacity: 0, x: '10%' }
  },
  zoom: {
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
    initial: { opacity: 0, scale: 0.9 }
  }
};

interface Props {
  style?: MotionStyle;
  children: React.ReactNode;
  variant?: keyof typeof variants;
  onAnimationComplete?: () => void;
}

export default function Motion ({ children, onAnimationComplete, style, variant = 'fade' }: Props) {
  return (
    <motion.div
      animate='animate'
      exit='exit'
      initial='initial'
      onAnimationComplete={onAnimationComplete}
      style={{ width: '100%', ...style }}
      variants={variants[variant]}
    >
      {children}
    </motion.div>
  );
}
