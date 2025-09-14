// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Teleport } from '@polkadot/extension-polkagate/src/hooks/useTeleport';
import type { DropdownOption } from '@polkadot/extension-polkagate/util/types';
import type { Inputs } from './types';

import { Stack, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import { NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB } from '@polkadot/extension-polkagate/src/util/constants';

import { Motion } from '../../components';
import { useChainInfo, useTranslation } from '../../hooks';
import { toTitleCase } from '../../util';
import NumberedTitle from './partials/NumberedTitle';
import RecipientAddress from './partials/RecipientAddress';
import SelectYourChain from './partials/SelectYourChain';
import { getSupportedDestinations } from './utils';

interface Props {
  assetId: string | undefined;
  genesisHash: string | undefined;
  inputs: Inputs | undefined;
  setInputs: React.Dispatch<React.SetStateAction<Inputs | undefined>>;
  teleportState: Teleport;
}

export default function Step2Recipient ({ assetId, genesisHash, inputs, setInputs, teleportState }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { chainName } = useChainInfo(genesisHash, true);

  const [selectedChain, setSelectedChain] = useState<DropdownOption>({ text: inputs?.recipientChain?.text ?? chainName ?? '', value: inputs?.recipientChain?.value ?? genesisHash ?? '' });

  const destinationOptions = useMemo((): DropdownOption[] => {
    if (!chainName || !inputs?.token) {
      return [];
    }

    try {
      const destinations = getSupportedDestinations(chainName, inputs.token);

      return destinations;
    } catch (error) {
      console.warn('Error getting supported destinations:', error);
      // Fallback to current network and teleport destinations
      const isNativeToken = String(assetId) === String(NATIVE_TOKEN_ASSET_ID) || String(assetId) === String(NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB);
      const currentChainOption = [{ text: chainName ?? '', value: genesisHash ?? '' }];
      const maybeTeleportDestinations =
        isNativeToken
          ? teleportState?.destinations?.map(({ genesisHash, info, paraId }) => ({ text: toTitleCase(info) ?? '', value: String(paraId ?? genesisHash ?? '') }))
          : [];

      return currentChainOption.concat(maybeTeleportDestinations);
    }
  }, [assetId, chainName, genesisHash, inputs?.token, teleportState?.destinations]);

  useEffect(() => {
    selectedChain && setInputs((prevInputs) => ({
      ...(prevInputs || {}),
      fee: undefined,
      recipientChain: selectedChain,
      transaction: undefined
    }));
  }, [destinationOptions, selectedChain, setInputs]);

  return (
    <Motion variant='slide'>
      <Typography color='text.secondary' sx={{ mt: '15px', textAlign: 'left', width: '100%' }} variant='B-4'>
        {t('Enter the recipient\'s address and its network')}
      </Typography>
      <Stack columnGap='15px' direction='row' sx={{ my: '20px' }}>
        <RecipientAddress
          genesisHash={genesisHash}
          inputs={inputs}
          setInputs={setInputs}
        />
        <Stack direction='column' justifyContent='space-between' sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '108px', p: '15px', width: '379px' }}>
          <NumberedTitle
            number={2}
            textPartInColor={t('recipient')}
            title={t('Select recipient network')}
          />
          <SelectYourChain
            chainName={selectedChain?.text ?? inputs?.recipientChain?.text ?? chainName}
            destinationOptions={destinationOptions}
            setSelectedChain={setSelectedChain}
            style={{ width: '100%' }}
            withTitle={false}
          />
        </Stack>
      </Stack>
    </Motion>
  );
}
