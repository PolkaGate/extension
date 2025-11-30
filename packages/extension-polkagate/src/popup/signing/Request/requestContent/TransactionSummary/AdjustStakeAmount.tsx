// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography, useTheme } from '@mui/material';
import { ArrowRight } from 'iconsax-react';
import React, { useMemo } from 'react';

import { ChainLogo, DisplayBalance } from '../../../../../components';
import { useChainInfo, useTranslation } from '../../../../../hooks';

interface Props {
  action: string;
  genesisHash: string;
  amount: string;
}

interface StakeAdjustmentInfo {
  color: string;
  style: React.CSSProperties;
  text: string;
}

function AdjustStakeAmount ({ action, amount, genesisHash }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const { decimal, token } = useChainInfo(genesisHash, true);

  const { color, style, text } = useMemo<StakeAdjustmentInfo>(() => {
    switch (action) {
      case 'bondExtra':
      case 'rebond':
        return {
          color: theme.palette.success.main,
          style: { transform: 'rotate(-45deg)' },
          text: t('Increase stake')
        };
      case 'unbond':
        return {
          color: theme.palette.error.light,
          style: { transform: 'rotate(45deg)' },
          text: t('Decrease stake')
        };

      default:
        return {
          color: theme.palette.primary.main,
          style: { },
          text: t('Stake')
        };
    }
  }, [action, t, theme.palette.error.light, theme.palette.primary.main, theme.palette.success.main]);

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
            {text}
          </Typography>
          <ArrowRight
            color={color}
            size={14}
            style={{ ...style }}
            variant='Linear'
          />
        </Stack>
      </Stack>
    </Stack>
  );
}

export default React.memo(AdjustStakeAmount);
