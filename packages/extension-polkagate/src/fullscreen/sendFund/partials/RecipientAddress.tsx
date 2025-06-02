// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Inputs } from '..';

import { Box, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { AddressInput, TwoToneText } from '../../../components';
import { useChainInfo, useTranslation } from '../../../hooks';

interface Props {
  genesisHash: string | undefined;
  setInputs: React.Dispatch<React.SetStateAction<Inputs | undefined>>
}

export default function RecipientAddress ({ genesisHash, setInputs }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { chain } = useChainInfo(genesisHash, true);

  const [address, setAddress] = useState<string | null>();

  useEffect(() => {
    address && setInputs((prevInputs) => ({
      ...(prevInputs || {}),
      recipientAddress: address
    }));
  }, [address, setInputs]);

  return (
    <>
      <Stack sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '108px', overflow: 'hidden', p: '15px', width: '379px' }}>
        <Stack columnGap='5px' direction='row'>
          <Box sx={{ alignItems: 'center', background: '#6743944D', borderRadius: '50%', display: 'flex', height: '20px', justifyContent: 'center', width: '20px' }}>
            <Typography color='#AA83DC' sx={{ textAlign: 'center' }} variant='B-3'>
              1
            </Typography>
          </Box>
          <Typography color='text.primary' sx={{ textAlign: 'center' }} variant='B-1'>
            <TwoToneText
              text={t('Recipient address')}
              textPartInColor={t('Recipient')}
            />
          </Typography>
        </Stack>
        <Stack alignItems='end' direction='row' justifyContent='space-between' width='100%'>
          <AddressInput
            address={address}
            chain={chain}
            setAddress={setAddress}
            style={{ mt: '10px', width: '100%' }}
            withSelect
          />
        </Stack>
      </Stack>
    </>
  );
}
