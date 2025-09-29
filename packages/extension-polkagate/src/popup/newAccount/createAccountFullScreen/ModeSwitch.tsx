// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeypairType } from '@polkadot/util-crypto/types';

import { Grid, Typography } from '@mui/material';
import { NetworkEthereum } from '@web3icons/react';
import { motion } from 'framer-motion';
import React, { useCallback } from 'react';

import { ChainLogo } from '@polkadot/extension-polkagate/src/components';
import { DEFAULT_TYPE } from '@polkadot/extension-polkagate/src/util/defaultType';

interface Props {
  setAccountType: React.Dispatch<React.SetStateAction<KeypairType>>
  isDefault: boolean;
}

export default function ModeSwitch ({ isDefault, setAccountType }: Props): React.ReactElement {
  const onModeSwitch = useCallback(() => {
    setAccountType((prev) => prev === DEFAULT_TYPE ? 'ethereum' : DEFAULT_TYPE);
  }, [setAccountType]);

  return (
    <Grid alignItems='center' columnGap='15px' container sx={{ bgcolor: '#2D1E4A', borderRadius: '18px', height: '44px', mb: '10px', position: 'relative', px: '5px', userSelect: 'none', width: 'fit-content' }}>
      {/* Animated highlight */}
      <motion.div
        layout
        style={{
          background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
          borderRadius: '14px',
          height: '36px',
          left: isDefault ? 5 : undefined,
          position: 'absolute',
          right: isDefault ? undefined : 5,
          top: 4,
          width: 'calc(50% - 10px)',
          zIndex: 0
        }}
        transition={{ damping: 30, stiffness: 300, type: 'spring' }}
      />
      <motion.div layout onClick={onModeSwitch} style={{ cursor: 'pointer', zIndex: 1 }}>
        <Grid item sx={{ alignItems: 'center', display: 'inline-flex', position: 'relative', px: '10px', py: '5px' }}>
          <ChainLogo chainName={'polkadot'} size={19.8} />
          <Typography pl='5px' variant='B-2'>
            {'Polkadot'}
          </Typography>
        </Grid>
      </motion.div>
      <motion.div layout onClick={onModeSwitch} style={{ cursor: 'pointer', zIndex: 1 }}>
        <Grid item sx={{ alignItems: 'center', display: 'inline-flex', position: 'relative', px: '10px', py: '5px' }}>
          <NetworkEthereum size={24} variant='branded' />
          <Typography pl='5px' variant='B-2'>
            {'Ethereum'}
          </Typography>
        </Grid>
      </motion.div>
    </Grid>
  );
}
