// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { Stack, Typography, useTheme } from '@mui/material';
import { ArrowRight, MagicStar } from 'iconsax-react';
import React from 'react';

import { ChainLogo, DisplayBalance } from '../../../../../components';
import { useChainInfo, useTranslation } from '../../../../../hooks';

interface Props {
  amount: BN | null;
  genesisHash: string;
}

function NominationPoolsBondExtra({ amount, genesisHash }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const { decimal, token } = useChainInfo(genesisHash, true);
  const maybeAmount = amount ? String(amount) : null;
  const Icon = maybeAmount ? ArrowRight : MagicStar;

  return (
    <Stack alignItems='center' columnGap='10px' direction='row' justifyContent='start'>
      <ChainLogo genesisHash={genesisHash} size={36} />
      <Stack alignItems='flex-start' direction='column'>
        {maybeAmount &&
          <DisplayBalance
            balance={maybeAmount}
            decimal={decimal}
            decimalPoint={2}
            style={{ color: '#EAEBF1', ...theme.typography['B-2'] }}
            token={token}
          />
        }
        <Stack alignItems='center' columnGap='5px' direction='row'>
          <Typography color='#BEAAD8' sx={{ textWrapMode: 'noWrap' }} variant='B-4'>
            {maybeAmount
              ? t('Increase stake')
              : t('Re-stake rewards')
            }
          </Typography>
          <Icon
            color={theme.palette.success.main}
            size={14}
            style={{ transform: maybeAmount ? 'rotate(-45deg)' : 'none' }}
            variant={maybeAmount ? 'Linear' : 'Bold'}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}

export default React.memo(NominationPoolsBondExtra);
