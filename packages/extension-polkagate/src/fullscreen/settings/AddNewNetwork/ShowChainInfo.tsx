// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MetadataDef } from '@polkadot/extension-inject/types';

import { Collapse, Stack, Typography, useTheme } from '@mui/material';
import { Hashtag } from 'iconsax-react';
import React from 'react';

import { toShortAddress } from '@polkadot/extension-polkagate/src/util';

import { useTranslation } from '../../../hooks';

interface ShowChainInfoProps {
  currencySign: string | undefined;
  metadata?: MetadataDef;
  price: number | null | undefined
}

interface ChainItemProps {
  value: any;
  label: string
}

function ChainItem({ label, value }: ChainItemProps): React.ReactElement {
  return (
    <Stack alignItems='start' direction='column' rowGap='4px'>
      <Typography color='text.primary' variant='B-1'>
        {value}
      </Typography>
      <Typography color='#674394' variant='S-2'>
        {label}
      </Typography>
    </Stack>

  );
}

function ShowChainInfo({ currencySign, metadata, price }: ShowChainInfoProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const labelColor = isDark ? '#7956A5' : theme.palette.primary.main;
  const infoStripBg = isDark ? '#2D1E4A' : '#F5F6FF';
  const infoStripBorder = isDark ? 'transparent' : '#E3E8F7';
  const hashFieldBg = isDark ? '#1B133CB2' : '#EFF1F9';
  const hashFieldBorder = isDark ? '#BEAAD833' : '#DDE3F4';

  return (
    <Collapse in={true} orientation='vertical' sx={{ m: '20px 0 20px', width: '100%' }}>
      {metadata &&
        <Stack alignItems='start' direction='column' sx={{ bgcolor: 'background.paper', borderRadius: '14px', width: '100%' }}>
          <Stack alignItems='start' direction='column' sx={{ p: '20px 20px 10px', width: '100%' }}>
            <Typography color={labelColor} fontSize='11px' fontWeight={400} sx={{ alignItems: 'center', display: 'flex', letterSpacing: 1, mb: '15px', textAlign: 'left', textTransform: 'uppercase', width: '100%' }} variant='S-1'>
              {t('Network information')}
            </Typography>
            <Stack alignItems='start' columnGap='20px' direction='row'>
              <Stack alignItems='start' direction='column'>
                <Stack alignItems='center' columnGap='4px' direction='row'>
                  <Typography color='text.primary' sx={{ textAlign: 'left', textTransform: 'uppercase' }} variant='H-3'>
                    {metadata.chain}
                  </Typography>
                  <Typography color='primary.main' sx={{ bgcolor: '#C6AECC26', borderRadius: '6px', lineHeight: '19px', px: '3px', textAlign: 'center', textTransform: 'uppercase' }} variant='S-2'>
                    {metadata.tokenSymbol}
                  </Typography>
                </Stack>
                <Typography color={labelColor} variant='S-2'>
                  {t('Network')}
                </Typography>
              </Stack>
              <Stack alignItems='start' direction='column'>
                <Typography color='text.primary' sx={{ textAlign: 'left', textTransform: 'uppercase' }} variant='H-3'>
                  {currencySign ?? '$'}{price ?? '0.00'}
                </Typography>
                <Typography color={labelColor} variant='S-2'>
                  {t('Token price')}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack alignItems='center' columnGap='10%' direction='row' sx={{ bgcolor: infoStripBg, border: '1px solid', borderColor: infoStripBorder, borderRadius: '14px', height: '62px', mx: '5px', pl: '15px', width: '98%' }}>
            <ChainItem
              label={t('Decimal')}
              value={metadata.tokenDecimals}
            />
            <ChainItem
              label={t('Type')}
              value={metadata.chainType}
            />
            <ChainItem
              label={t('Spec version')}
              value={metadata.specVersion}
            />
            <ChainItem
              label={t('Ss58 format')}
              value={metadata.ss58Format}
            />
          </Stack>
          <Stack alignItems='start' columnGap='20px' direction='column' sx={{ my: '20px', pl: '20px', width: '100%' }}>
            <Typography color='text.primary' sx={{ alignItems: 'center', mb: '10px', textAlign: 'left', width: '100%' }} variant='B-1'>
              {t('Genesis Hash')}
            </Typography>
            <Stack alignItems='center' columnGap='10px' direction='row' sx={{ bgcolor: hashFieldBg, border: '1px solid', borderColor: hashFieldBorder, borderRadius: '12px', height: '44px', pl: '20px', width: '95%' }}>
              <Hashtag color={theme.palette.text.secondary} size='18px' variant='Bulk' />
              <Typography color='text.secondary' variant='B-1'>
                {toShortAddress(metadata.genesisHash, 15)}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      }
    </Collapse>
  );
}

export default ShowChainInfo;
