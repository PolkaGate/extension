// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

import { ChainLogo, DisplayBalance, Identity2 } from '../../../../components';
import { useChainInfo, useTranslation } from '../../../../hooks';

interface Props {
  genesisHash: string;
  amount: string;
  to: string;
}

function Transfer ({ amount, genesisHash, to }: Props): React.ReactElement<Props> {
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
            {t('Transfer to')}
          </Typography>
          <Identity2
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
