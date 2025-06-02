// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Stack, Typography } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router';

import { Motion, TwoToneText } from '../../components';
import { useTranslation } from '../../hooks';
import SelectToken from './partials/SelectToken';
import SelectYourAccount from './partials/SelectYourAccount';
import SelectYourChain from './partials/SelectYourChain';

export default function Step1Account(): React.ReactElement {
  const { t } = useTranslation();

  const { address, assetId, genesisHash } = useParams<{ genesisHash: string, address: string, assetId: string }>();

  return (
    <Motion variant='fade'>
      <Typography color='text.secondary' sx={{ mt: '15px', textAlign: 'left', width: '100%' }} variant='B-4'>
        {t('Select your account and chain')}
      </Typography>
      <Stack columnGap='15px' direction='row' sx={{ my: '20px' }}>
        <SelectYourAccount
          address={address}
          genesisHash={genesisHash}
        />
        <Stack direction='column' justifyContent='space-between' sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '108px', p: '15px', width: '430px' }}>
          <Stack columnGap='5px' direction='row'>
            <Box sx={{ alignItems: 'center', background: '#6743944D', borderRadius: '50%', display: 'flex', height: '20px', justifyContent: 'center', width: '20px' }}>
              <Typography color='#AA83DC' sx={{ textAlign: 'center' }} variant='B-3'>
                2
              </Typography>
            </Box>
            <Typography color='text.primary' sx={{ textAlign: 'center' }} variant='B-1'>
              <TwoToneText
                text={t('Select your chain')}
                textPartInColor={t('your')}
              />
            </Typography>
          </Stack>
          <Stack direction='row' justifyContent='space-between'>
            <SelectYourChain
              genesisHash={genesisHash}
            />
            <SelectToken
              address={address}
              assetId={assetId}
              genesisHash={genesisHash}
            />
          </Stack>
        </Stack>
      </Stack>
    </Motion>
  );
}
