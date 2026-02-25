// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Inputs } from './types';

import { Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Motion } from '../../components';
import { useAccountAssets, useChainInfo, useTranslation } from '../../hooks';
import NumberedTitle from './partials/NumberedTitle';
import SelectToken from './partials/SelectToken';
import SelectYourAccount from './partials/SelectYourAccount';
import SelectYourChain from './partials/SelectYourChain';

interface Props {
  inputs: Inputs | undefined;
  setInputs: React.Dispatch<React.SetStateAction<Inputs | undefined>>;
}

export default function Step1Sender({ inputs, setInputs }: Props): React.ReactElement {
  const { t } = useTranslation();

  const { address, assetId, genesisHash } = useParams<{ address: string, genesisHash: string, assetId: string }>();
  const accountAssets = useAccountAssets(address);

  const { chainName } = useChainInfo(genesisHash, true);
  const accountAssetsOnCurrentChain = useMemo(() => accountAssets?.filter((asset) => asset.genesisHash === genesisHash), [accountAssets, genesisHash]);
  const options = useMemo(() => {
    if (!accountAssets) {
      return [];
    }

    const seen = new Set<string>();

    return accountAssets
      .map(({ chainName, genesisHash, totalBalance }) => (totalBalance?.isZero() ? undefined : { text: chainName, value: genesisHash }))
      .filter((a) => !!a)
      .filter(({ value }) => {
        if (seen.has(value)) {
          return false;
        }

        seen.add(value);

        return true;
      });
  }, [accountAssets]);

  return (
    <Motion style={{ width: 'fit-content' }} variant='fade'>
      <Typography color='text.secondary' sx={{ mt: '15px', textAlign: 'left', width: 'fit-content' }} variant='B-4'>
        {t('Choose the sender account, network and token')}
      </Typography>
      <Stack columnGap='15px' direction='row' sx={{ my: '20px', width: 'fit-content' }}>
        <SelectYourAccount
          address={address}
          genesisHash={genesisHash}
        />
        <Stack direction='column' justifyContent='space-between' sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '108px', p: '15px', width: '430px' }}>
          <NumberedTitle
            number={2}
            textPartInColor={t('your')}
            title={t('Select your network & token')}
          />
          <Stack direction='row' justifyContent='space-between'>
            <SelectYourChain
              chainName={chainName}
              chainOptions={options}
            />
            <SelectToken
              accountAssets={accountAssetsOnCurrentChain}
              address={address}
              assetId={assetId}
              genesisHash={genesisHash}
              inputs={inputs}
              setInputs={setInputs}
            />
          </Stack>
        </Stack>
      </Stack>
    </Motion>
  );
}
