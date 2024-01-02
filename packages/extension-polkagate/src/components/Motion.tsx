// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { motion, MotionStyle } from 'framer-motion';
import * as React from 'react';

interface Props {
  style?: MotionStyle | undefined;
  children: React.ReactNode;
}

export default function Motion({ children, style }: Props) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      style={style}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
