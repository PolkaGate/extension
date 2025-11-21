// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography, useTheme } from '@mui/material';
import { ArrowRight } from 'iconsax-react';
import React from 'react';

import { ChainLogo, DisplayBalance } from '../../../../components';
import { useChainInfo, useTranslation } from '../../../../hooks';

interface Props {
  genesisHash: string;
  amount: string;
}

function Bond ({ amount, genesisHash }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const { decimal, token } = useChainInfo(genesisHash, true);

  return (
    <Stack alignItems='center' columnGap='10px' direction='row' justifyContent='start'>
      <ChainLogo genesisHash={genesisHash} size={36} />
      <Stack alignItems='flex-start' direction='column'>
        <DisplayBalance
          balance={amount}
          decimal={decimal}
          decimalPoint={2}
          style={{ color: '#EAEBF1', ...theme.typography['B-2'] }}
          token={token}
        />
        <Stack alignItems='center' columnGap='5px' direction='row'>
          <Typography color='#BEAAD8' sx={{ textWrapMode: 'noWrap' }} variant='B-4'>
            {t('Increase stake')}
          </Typography>
          <ArrowRight
            color={theme.palette.success.main}
            size={14}
            style={{ transform: 'rotate(-45deg)' }}
            variant='Linear'
          />
        </Stack>
      </Stack>
    </Stack>
  );
}

export default React.memo(Bond);
