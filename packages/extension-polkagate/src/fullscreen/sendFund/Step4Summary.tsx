// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Teleport } from '@polkadot/extension-polkagate/src/hooks/useTeleport';
import type { Inputs } from '.';

import { Box, Divider, Stack, Typography, useTheme } from '@mui/material';
import { ArrowCircleRight2 } from 'iconsax-react';
import React, { useMemo } from 'react';
import { useParams } from 'react-router';

import { getValue } from '@polkadot/extension-polkagate/src/popup/account/util';
import { FLOATING_POINT_DIGIT } from '@polkadot/extension-polkagate/src/util/constants';
import getLogo2 from '@polkadot/extension-polkagate/src/util/getLogo2';

import { AssetLogo, Motion, ShowBalance4 } from '../../components';
import { useAccountAssets, useChainInfo, useTranslation } from '../../hooks';
import FromToBox from './FromToBox';

interface Props {
  inputs: Inputs | undefined;
  teleportState: Teleport;
}

export default function Step4Summary({ inputs }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const { address, assetId, genesisHash } = useParams<{ address: string, genesisHash: string, assetId: string }>();
  const accountAssets = useAccountAssets(address);
  const { chainName } = useChainInfo(genesisHash);

  const assetToTransfer = useMemo(() =>
    accountAssets?.find((asset) => asset.genesisHash === genesisHash && String(asset.assetId) === assetId),
    [accountAssets, assetId, genesisHash]);

  const transferableBalance = useMemo(() => getValue('transferable', assetToTransfer), [assetToTransfer]);
  const logoInfo = useMemo(() => getLogo2(genesisHash, assetToTransfer?.token), [assetToTransfer?.token, genesisHash]);

    console.log('inputs:', inputs)
  
  return (
    <Motion variant='fade'>
      <Stack direction='column' justifyContent='start' sx={{ mt: '5px' }}>
        <Typography color='primary.main' sx={{ textAlign: 'left' }} variant='B-2'>
          {t('Amount')}
        </Typography>
        <Stack alignItems='center' columnGap='8px' direction='row' justifyContent='start'>
          <AssetLogo assetSize='32px' genesisHash={genesisHash} logo={logoInfo?.logo} />
          <Typography color='text.primary' sx={{ height: '50px', textAlign: 'left' }} variant='H-1'>
            <ShowBalance4
              balance={transferableBalance}
              balanceProps={{ tokenColor: theme.palette.text.secondary }}
              decimalPoint={FLOATING_POINT_DIGIT}
              genesisHash={genesisHash}
            />
          </Typography>
        </Stack>
      </Stack>
      <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '146px', mt: '20px', p: '15px', width: '766px' }}>
        <FromToBox
          address={address}
          chainName={chainName}
          genesisHash={genesisHash}
          label={t('From')}
        />
        <Divider orientation='vertical' sx={{ color: '#67439433', height: '110px' }} textAlign='center'>
          <Box sx={{ alignItems: 'center', bgcolor: '#2D1E4A', border: '2px solid #674394', borderRadius: '50%', display: 'flex', height: '32px', justifyContent: 'center', width: '32px' }}>
            <ArrowCircleRight2 color={theme.palette.primary.main} size='24px' variant='Bold' />
          </Box>
        </Divider>
        <FromToBox
          address={inputs?.recipientAddress}
          chainName={inputs?.recipientChainName}
          genesisHash={inputs?.recipientGenesisHashOrParaId}
          label={t('To')}
        />
      </Stack>
      <Box sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', my: '10px', width: '100%' }} />
    </Motion>
  );
}
