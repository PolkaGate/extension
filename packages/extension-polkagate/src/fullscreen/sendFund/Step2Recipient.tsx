// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Teleport } from '@polkadot/extension-polkagate/src/hooks/useTeleport';
import type { DropdownOption } from '@polkadot/extension-polkagate/util/types';
import type { Inputs } from '.';

import { Box, Stack, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import { NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB } from '@polkadot/extension-polkagate/src/util/constants';

import { Motion, TwoToneText } from '../../components';
import { useChainInfo, useTranslation } from '../../hooks';
import { toTitleCase } from '../../util';
import RecipientAddress from './partials/RecipientAddress';
import SelectYourChain from './partials/SelectYourChain';

interface Props {
  assetId: string | undefined;
  genesisHash: string | undefined;
  setInputs: React.Dispatch<React.SetStateAction<Inputs | undefined>>;
  teleportState: Teleport;
}

export default function Step2Recipient ({ assetId, genesisHash, setInputs, teleportState }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { chainName } = useChainInfo(genesisHash, true);

  const [recipientGenesisHashOrParaId, setRecipientGenesisHashOrParaId] = useState<string | undefined>(genesisHash);

  const destinationOptions = useMemo((): DropdownOption[] => {
    const isNativeToken = String(assetId) === String(NATIVE_TOKEN_ASSET_ID) || String(assetId) === String(NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB);
    const currentChainOption = [{ text: chainName ?? '', value: genesisHash ?? '' }];
    const maybeTeleportDestinations =
      isNativeToken
        ? teleportState?.destinations?.map(({ genesisHash, info, paraId }) => ({ text: toTitleCase(info) ?? '', value: String(paraId ?? genesisHash ?? '') }))
        : [];

    return currentChainOption.concat(maybeTeleportDestinations);
  }, [assetId, chainName, genesisHash, teleportState?.destinations]);

  useEffect(() => {
    recipientGenesisHashOrParaId && setInputs((prevInputs) => ({
      ...(prevInputs || {}),
      recipientChainName: destinationOptions.find(({ value }) => value === recipientGenesisHashOrParaId)?.text,
      recipientGenesisHashOrParaId
    }));
  }, [destinationOptions, recipientGenesisHashOrParaId, setInputs]);

  return (
    <Motion variant='slide'>
      <Typography color='text.secondary' sx={{ mt: '15px', textAlign: 'left', width: '100%' }} variant='B-4'>
        {t('Enter the recipient\'s address and its chain')}
      </Typography>
      <Stack columnGap='15px' direction='row' sx={{ my: '20px' }}>
        <RecipientAddress
          genesisHash={recipientGenesisHashOrParaId}
          setInputs={setInputs}
        />
        <Stack direction='column' justifyContent='space-between' sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '108px', p: '15px', width: '379px' }}>
          <Stack columnGap='5px' direction='row'>
            <Box sx={{ alignItems: 'center', background: '#6743944D', borderRadius: '50%', display: 'flex', height: '20px', justifyContent: 'center', width: '20px' }}>
              <Typography color='#AA83DC' sx={{ textAlign: 'center' }} variant='B-3'>
                2
              </Typography>
            </Box>
            <Typography color='text.primary' sx={{ textAlign: 'center' }} variant='B-1'>
              <TwoToneText
                text={t('Select recipient chain')}
                textPartInColor={t('recipient')}
              />
            </Typography>
          </Stack>
          <SelectYourChain
            destinationOptions={destinationOptions}
            genesisHash={genesisHash}
            setGenesisHash={setRecipientGenesisHashOrParaId}
            style={{ width: '100%' }}
          />
        </Stack>
      </Stack>
    </Motion>
  );
}
