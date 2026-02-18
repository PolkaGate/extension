// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeypairType } from '@polkadot/util-crypto/types';

import { Grid, Stack, Typography, useTheme } from '@mui/material';
import { NetworkEthereum } from '@web3icons/react';
import { motion } from 'framer-motion';
import { Warning2 } from 'iconsax-react';
import React, { useCallback } from 'react';

import { ChainLogo } from '@polkadot/extension-polkagate/src/components';
import { useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { DEFAULT_TYPE } from '@polkadot/extension-polkagate/src/util/defaultType';

interface Props {
  accountType: KeypairType
  setAccountType: React.Dispatch<React.SetStateAction<KeypairType>>
  isDefault: boolean;
}

export default function ModeSwitch({ accountType, isDefault, setAccountType }: Props): React.ReactElement {
  const { t } = useTranslation();
const theme = useTheme();

  const onModeSwitch = useCallback(() => {
    setAccountType((prev) => prev === DEFAULT_TYPE ? 'ethereum' : DEFAULT_TYPE);
  }, [setAccountType]);

  return (
    <Stack direction='column'>
      <Grid alignItems='center' columnGap='15px' container sx={{ bgcolor: '#2D1E4A', borderRadius: '18px', height: '44px', mb: '10px', position: 'relative', px: '5px', userSelect: 'none', width: 'fit-content' }}>
        {/* Animated highlight */}
        <motion.div
          layout
          style={{
            background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
            borderRadius: '14px',
            height: '36px',
            left: isDefault ? 5 : '50%',
            position: 'absolute',
            right: isDefault ? '50%' : 5,
            top: 4,
            zIndex: 0
          }}
          transition={{ damping: 30, stiffness: 300, type: 'spring' }}
        />
        <motion.div layout onClick={onModeSwitch} style={{ cursor: 'pointer', zIndex: 1 }}>
          <Grid item sx={{ alignItems: 'center', display: 'inline-flex', position: 'relative', px: '10px', py: '5px' }}>
            <ChainLogo chainName={'polkadot'} size={19.8} />
            <Typography pl='5px' variant='B-2'>
              {'Substrate'}
            </Typography>
          </Grid>
        </motion.div>
        <motion.div layout onClick={onModeSwitch} style={{ cursor: 'pointer', zIndex: 1 }}>
          <Grid item sx={{ alignItems: 'center', display: 'inline-flex', position: 'relative', px: '10px', py: '5px' }}>
            <NetworkEthereum size={24} variant='branded' />
            <Typography pl='5px' variant='B-2'>
              {'EVM'}
            </Typography>
          </Grid>
        </motion.div>
      </Grid>
      <Stack alignItems='center' columnGap='5px' direction='row' ml='10px'>
        <Warning2 color='#AA83DC' size='18' variant='Bold' />
        <Typography color={theme.palette.text.secondary} textAlign='left' variant='B-5' width='100%'>
          {accountType !== 'ethereum' ? t('Polkadot & parachains') : t('Moonbeam & other EVM networks')}
        </Typography>
      </Stack>
    </Stack>
  );
}
