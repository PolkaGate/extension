// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

import { DisplayBalance, Identity, Logo } from '../../../../../components';
import { useChainInfo, useTranslation } from '../../../../../hooks';

interface Props {
  genesisHash: string;
  amount: string;
  to: string;
}

function Transfer({ amount, genesisHash, to }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { decimal, token } = useChainInfo(genesisHash, true);

  return (
    <Stack alignItems='center' columnGap='10px' direction='row' justifyContent='start'>
      <Logo genesisHash={genesisHash} size={36} />
      <Stack alignItems='flex-start' direction='column'>
        <DisplayBalance
          balance={amount}
          decimal={decimal}
          decimalPoint={2}
          style={{ color: isDark ? '#EAEBF1' : '#2D1E4A', ...theme.typography['B-2'] }}
          token={token}
        />
        <Stack alignItems='center' columnGap='5px' direction='row'>
          <Typography color={isDark ? '#BEAAD8' : '#745E9F'} sx={{ textWrapMode: 'noWrap' }} variant='B-4'>
            {t('Transfer to')}
          </Typography>
          <Identity
            address={to}
            addressStyle={{ color: 'text.secondary', variant: 'B-4' }}
            charsCount={4}
            genesisHash={genesisHash}
            identiconSize={15}
            identiconStyle={{ marginRight: '5px' }}
            showSocial={false}
            style={{ color: 'text.primary', variant: 'B-2' }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}

export default React.memo(Transfer);
