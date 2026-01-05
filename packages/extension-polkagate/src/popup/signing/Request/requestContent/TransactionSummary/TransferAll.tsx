// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Variant } from '@mui/material/styles/createTypography';

import { Stack, Typography } from '@mui/material';
import React from 'react';

import { ChainLogo, ShortAddress } from '../../../../../components';
import { useAccountName, useTranslation } from '../../../../../hooks';
import PolkaGateIdenticon from '../../../../../style/PolkaGateIdenticon';
import { toTitleCase } from '../../../../../util/string';

interface Props {
  genesisHash: string;
  to: string;
}

function TransferAll ({ genesisHash, to }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const accountName = useAccountName(to || '');

  return (
    <Stack alignItems='center' columnGap='10px' direction='row' justifyContent='start'>
      <ChainLogo genesisHash={genesisHash} size={36} />
      <Stack alignItems='flex-start' direction='column'>
       <Typography color='#EAEBF1' sx={{ textWrapMode: 'noWrap' }} variant='B-2'>
            {t('Entire balance')}
          </Typography>
        <Stack alignItems='center' columnGap='5px' direction='row'>
          <Typography color='#BEAAD8' sx={{ textWrapMode: 'noWrap' }} variant='B-4'>
            {t('Transfer to')}
          </Typography>
          <PolkaGateIdenticon
            address={to}
            size={15}
          />
          {accountName
            ? <Typography color='text.primary' textAlign='left' variant='B-2' width='100%'>
              {toTitleCase(accountName)}
            </Typography>
            : (
              <ShortAddress
                address={to}
                charsCount={4}
                style={{ color: 'text.secondary', justifyContent: 'flex-start' }}
                variant={'B-4' as Variant}
              />)
          }
        </Stack>
      </Stack>
    </Stack>
  );
}

export default React.memo(TransferAll);
