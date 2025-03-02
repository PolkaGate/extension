// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MotionStyle } from 'framer-motion';

import { motion } from 'framer-motion';
import * as React from 'react';

interface Props {
  style?: MotionStyle;
  children: React.ReactNode;
  variant?: 'fade' | 'slide' | 'zoom' | 'flip';
}

const variants = {
  fade: {
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
    initial: { opacity: 0 }
  },
  slide: {
    animate: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { x: '-100%', opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } },
    initial: { x: '20%', opacity: 0 }
  },
  zoom: {
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
    initial: { opacity: 0, scale: 0.9 }
  },
  flip: {
    animate: { rotateY: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { rotateY: -90, opacity: 0, transition: { duration: 0.5 } },
    initial: { rotateY: 90, opacity: 0 }
  }
};

export default function Motion ({ children, style, variant = 'fade' }: Props) {
  return (
    <motion.div
      animate='animate'
      exit='exit'
      initial='initial'
      style={style}
      variants={variants[variant]}
    >
      {children}
    </motion.div>
  );
}
