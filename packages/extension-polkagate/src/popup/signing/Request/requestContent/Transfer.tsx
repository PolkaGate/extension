// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Variant } from '@mui/material/styles/createTypography';

import { Box, Stack, Typography } from '@mui/material';
import React from 'react';

import { ChainLogo, FormatBalance2, ShortAddress } from '../../../../components';
import { useAccountName, useChainInfo, useTranslation } from '../../../../hooks';
import PolkaGateIdenticon from '../../../../style/PolkaGateIdenticon';
import { toTitleCase } from '../../../../util/string';

interface Props {
  genesisHash: string;
  amount: string;
  to: string;
}

function Transfer ({ amount, genesisHash, to }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const accountName = useAccountName(to || '');

  const { decimal, token } = useChainInfo(genesisHash, true);

  return (
    <Stack alignItems='center' columnGap='10px' direction='row' justifyContent='start'>
      <ChainLogo genesisHash={genesisHash} size={36} />
      <Stack alignItems='flex-start' direction='column'>
        <Typography color='#EAEBF1' variant='B-2'>
          {decimal && token &&
            <FormatBalance2
              decimalPoint={2}
              decimals={[decimal]}
              tokens={[token]}
              value={amount}
            />}
        </Typography>
        <Stack alignItems='center' columnGap='5px' direction='row'>
          <Typography color='#BEAAD8' sx={{ textWrapMode: 'noWrap' }} variant='B-4'>
            {t('Transfer to')}
          </Typography>
          <Box sx={{ mt: '-5px' }}>
            <PolkaGateIdenticon
              address={to}
              size={15}
            />
          </Box>
          {accountName
            ? <Typography color='text.primary' textAlign='left' variant='B-2' width='100%'>
              {toTitleCase(accountName)}
            </Typography>
            : <ShortAddress
              address={to}
              charsCount={4}
              style={{ color: 'text.secondary', justifyContent: 'flex-start' }}
              variant={'B-4' as Variant}
              />
          }
        </Stack>
      </Stack>
    </Stack>
  );
}

export default React.memo(Transfer);
