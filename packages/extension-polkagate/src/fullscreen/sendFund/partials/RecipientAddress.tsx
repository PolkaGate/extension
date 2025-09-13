// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Inputs } from '../types';

import { Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { AddressInput } from '../../../components';
import { useChainInfo, useTranslation } from '../../../hooks';
import NumberedTitle from './NumberedTitle';

interface Props {
  genesisHash: string | undefined;
  inputs: Inputs | undefined;
  setInputs: React.Dispatch<React.SetStateAction<Inputs | undefined>>
}

export default function RecipientAddress ({ genesisHash, inputs, setInputs }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { chain } = useChainInfo(genesisHash, true);

  const [address, setAddress] = useState<string | null | undefined>(inputs?.recipientAddress);
  const [isError, setIsError] = useState<boolean>();

  useEffect(() => {
    address && setInputs((prevInputs) => ({
      ...(prevInputs || {}),
      recipientAddress: address
    }));
  }, [address, setInputs]);

  return (
    <Stack direction='column'>
      <Stack sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '108px', overflow: 'hidden', p: '15px', width: '379px' }}>
        <NumberedTitle
          number={1}
          textPartInColor={t('Recipient')}
          title={t('Recipient address')}
        />
        <Stack alignItems='end' direction='row' justifyContent='space-between' width='100%'>
          <AddressInput
            address={address}
            chain={chain}
            setAddress={setAddress}
            setIsError={setIsError}
            style={{ mt: '10px', width: '100%' }}
            withSelect
          />
        </Stack>
      </Stack>
      {isError &&
        <Typography color='warning.main' sx={{ ml: '18px', textAlign: 'left' }} variant='B-1'>
          {t('Invalid address')}
        </Typography>
      }
    </Stack>
  );
}
