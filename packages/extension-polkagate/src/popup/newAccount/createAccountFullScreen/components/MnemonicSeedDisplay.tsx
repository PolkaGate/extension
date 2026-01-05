// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, type SxProps, type Theme, Typography } from '@mui/material';
import React from 'react';

import TwoToneText from '../../../../components/TwoToneText';
import { useTranslation } from '../../../../hooks';
import CopySeedButton from './CopySeedButton';
import DownloadSeedButton from './DownloadSeedButton';
import IllustrateSeed from './IllustrateSeed';

const MnemonicSeedDisplay = ({ seed, style }: { style?: SxProps<Theme>, seed: null | string }) => {
  const { t } = useTranslation();

  return (
    <Grid container display='block' item sx={style}>
      <Stack alignItems='center' columnGap='5px' direction='row'>
        <Typography mr='5px' textAlign='left' variant='B-2'>
          <TwoToneText
            text={t('Generated 12-word recovery phrase')}
            textPartInColor={t('12-word recovery phrase')}
          />
        </Typography>
        <DownloadSeedButton
          style={{ width: 'fit-content' }}
          value={seed ?? ''}
        />
        <CopySeedButton
          style={{ width: 'fit-content' }}
          value={seed ?? ''}
        />
      </Stack>
      <IllustrateSeed seed={seed} style={{ marginTop: '10px' }} />
    </Grid>
  );
};

export default React.memo(MnemonicSeedDisplay);
