// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenTotal } from '../buildInteractionGraph';
import type { SelectedItem } from '../types';

import { Grid, Stack, Typography, useTheme } from '@mui/material';
import { createAssets } from '@polkagate/apps-config/assets';
import React, { memo, useMemo } from 'react';

import { CopyAddressButton, FormatPrice } from '@polkadot/extension-polkagate/src/components';
import Logo from '@polkadot/extension-polkagate/src/components/Logo';
import HistoryIcon from '@polkadot/extension-polkagate/src/fullscreen/history/HistoryIcon';
import { formatDecimal, formatTimestamp, toCamelCase, toShortAddress } from '@polkadot/extension-polkagate/src/util';
import resolveLogoInfo from '@polkadot/extension-polkagate/src/util/logo/resolveLogoInfo';

import { useChainInfo, usePrices, useTokenPriceBySymbol, useTranslation } from '../../../hooks';
import { formatOption, recentIconBackground } from '../utils';

const assetsChains = createAssets();

function TokenTotalRow({ amount, genesisHash, token }: TokenTotal) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { chainName, token: nativeToken } = useChainInfo(genesisHash, true);
  const pricesInCurrencies = usePrices();
  const isNativeToken = Boolean(token && nativeToken && token.toLowerCase() === nativeToken.toLowerCase());
  const maybeKnownAsset = useMemo(() => {
    const chainKey = toCamelCase(chainName || '');
    const candidateChainKeys = [...new Set([chainKey, chainKey && `${chainKey}AssetHub`].filter(Boolean))];

    return candidateChainKeys
      .flatMap((candidateChainKey) => assetsChains[candidateChainKey] || [])
      .find(({ symbol }) => symbol.toLowerCase() === token.toLowerCase());
  }, [chainName, token]);
  const logoInfo = useMemo(() => {
    if (maybeKnownAsset) {
      return maybeKnownAsset.ui;
    }

    if (isNativeToken) {
      return resolveLogoInfo(genesisHash, token);
    }

    return undefined;
  }, [genesisHash, isNativeToken, maybeKnownAsset, token]);
  const nativePrice = useTokenPriceBySymbol(isNativeToken ? token : undefined, genesisHash);
  const assetPrice = maybeKnownAsset?.priceId ? pricesInCurrencies?.prices?.[maybeKnownAsset.priceId]?.value : undefined;
  const price = isNativeToken ? nativePrice.price : assetPrice;
  const numericAmount = useMemo(() => Number(amount), [amount]);
  const fiatValue = useMemo(() => price === undefined || !Number.isFinite(numericAmount) ? undefined : numericAmount * price, [numericAmount, price]);

  return (
    <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ columnGap: '10px', width: '100%' }}>
      <Logo
        assetSize='24px'
        baseTokenSize='0'
        fallbackText={token}
        genesisHash={isNativeToken ? genesisHash : undefined}
        logo={logoInfo?.logo}
        subLogo={undefined}
        token={token}
      />
      <Stack alignItems='flex-end' direction='column' rowGap='3px' sx={{ minWidth: 0 }}>
        <Typography color='text.primary' noWrap sx={{ textAlign: 'right' }} variant='B-2'>
          {formatDecimal(amount, 4, true)} {token}
        </Typography>
        {fiatValue !== undefined && fiatValue > 0 &&
          <FormatPrice
            commify
            decimalColor={isDark ? '#BEAAD8' : theme.palette.text.secondary}
            fontFamily='Inter'
            fontSize='12px'
            fontWeight={500}
            height={14}
            num={fiatValue}
            textAlign='right'
            textColor={isDark ? '#BEAAD8' : theme.palette.text.secondary}
            width='fit-content'
          />
        }
      </Stack>
    </Stack>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Stack sx={{ bgcolor: isDark ? '#1B133C' : '#F3F5FD', border: '1px solid', borderColor: isDark ? '#2D1E4A' : '#DDE3F4', borderRadius: '10px', minWidth: '92px', p: '8px' }}>
      <Typography color='text.secondary' variant='B-5'>
        {label}
      </Typography>
      <Typography color='text.primary' variant='B-1'>
        {value}
      </Typography>
    </Stack>
  );
}

function DetailPanel({ selected }: { selected: SelectedItem }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!selected) {
    return (
      <Stack justifyContent='center' sx={{ height: '100%', px: '18px' }}>
        <Typography color='text.secondary' textAlign='center' variant='B-2'>
          {t('Select a node or connection to inspect interactions.')}
        </Typography>
      </Stack>
    );
  }

  if (selected.type === 'node') {
    const { item } = selected;

    return (
      <Stack direction='column' sx={{ p: '18px', pb: '48px' }}>
        <Typography color='text.primary' sx={{ mb: '10px' }} variant='H-3'>
          {item.name || (item.isCenter ? t('Selected account') : t('Unknown'))}
        </Typography>
        <Stack alignItems='center' direction='row' justifyContent='center' sx={{ columnGap: '6px', maxWidth: '100%', mb: '16px' }}>
          <Typography color='text.secondary' noWrap title={item.address} variant='B-4'>
            {toShortAddress(item.address, 8)}
          </Typography>
          <CopyAddressButton address={item.address} padding={0} size={17} />
        </Stack>
        <Stack direction='row' flexWrap='wrap' gap='8px' justifyContent='center'>
          <Metric label={t('Transactions')} value={item.txCount} />
          <Metric label={t('Sent')} value={item.sentCount} />
          <Metric label={t('Received')} value={item.receivedCount} />
          {item.failedCount > 0 &&
            <Metric label={t('Failed')} value={item.failedCount} />
          }
        </Stack>
        {item.isValidator &&
          <Typography color='warning.main' sx={{ mt: '10px', textAlign: 'center' }} variant='B-4'>
            {t('Validator')}
          </Typography>
        }
      </Stack>
    );
  }

  const { item, node } = selected;
  const sortedTransactions = item.transactions
    .slice()
    .sort((a, b) => b.date - a.date);

  return (
    <Stack direction='column' rowGap='14px' sx={{ height: '100%', overflow: 'hidden', p: '18px', pb: '48px' }}>
      <Typography color='text.primary' variant='H-3'>
        {node?.name || (node ? t('Unknown') : formatOption(t('connection')))}
      </Typography>
      {node &&
        <>
          <Stack alignItems='center' direction='row' justifyContent='center' sx={{ columnGap: '6px', maxWidth: '100%' }}>
            <Typography color='text.secondary' noWrap title={node.address} variant='B-4'>
              {toShortAddress(node.address, 8)}
            </Typography>
            <CopyAddressButton address={node.address} padding={0} size={17} />
          </Stack>
          {node.isValidator &&
            <Typography color='warning.main' sx={{ mt: '-8px', textAlign: 'center' }} variant='B-5'>
              {t('Validator')}
            </Typography>
          }
        </>
      }
      <Stack direction='row' flexWrap='wrap' gap='8px' justifyContent='center'>
        <Metric label={t('Transactions')} value={item.txCount} />
        <Metric label={t('Sent')} value={item.sentCount} />
        <Metric label={t('Received')} value={item.receivedCount} />
        {item.failedCount > 0 &&
          <Metric label={t('Failed')} value={item.failedCount} />
        }
      </Stack>
      <Stack alignItems='start' direction='column' rowGap='7px' sx={{ width: '100%' }}>
        <Typography color='text.secondary' sx={{ textTransform: 'uppercase' }} variant='S-1'>
          {t('Totals')}
        </Typography>
        <Stack direction='column' rowGap='7px' sx={{ bgcolor: isDark ? '#1B133C' : '#F3F5FD', border: '1px solid', borderColor: isDark ? '#2D1E4A' : '#DDE3F4', borderRadius: '12px', p: '10px 12px', width: '100%' }}>
          {item.tokens.map((tokenTotal) => (
            <TokenTotalRow key={`${tokenTotal.genesisHash ?? 'native'}:${tokenTotal.token}`} {...tokenTotal} />
          ))}
        </Stack>
      </Stack>
      <Stack alignItems='start' direction='column' rowGap='7px' sx={{ overflow: 'hidden', width: '100%' }}>
        <Typography color='text.secondary' sx={{ pl: '2px', textTransform: 'uppercase' }} variant='S-1'>
          {t('Transactions')}
        </Typography>
        <Stack direction='column' rowGap='6px' sx={{ overflowY: 'auto', pr: '4px', width: '100%' }}>
          {sortedTransactions.map((history) => (
            <Stack
              alignItems='center'
              direction='row'
              key={`${history.txHash ?? history.extrinsicIndex ?? history.date}-${history.action}-${history.amount}`}
              sx={{ bgcolor: isDark ? '#1B133C' : '#F3F5FD', borderRadius: '10px', columnGap: '9px', minHeight: '58px', px: '10px', py: '8px', width: '100%' }}
            >
              <Grid alignItems='center' container item justifyContent='center' sx={{ background: recentIconBackground(history.subAction ?? history.action, isDark), border: '2px solid', borderColor: isDark ? '#2D1E4A' : '#EEF1FF', borderRadius: '999px', flexShrink: 0, height: '36px', width: '36px' }}>
                <HistoryIcon action={history.subAction ?? history.action} isFullscreen={false} />
              </Grid>
              <Stack direction='column' rowGap='3px' sx={{ minWidth: 0, width: '100%' }}>
                <Stack alignItems='baseline' direction='row' justifyContent='space-between' sx={{ columnGap: '10px', minWidth: 0 }}>
                  <Typography color='text.primary' noWrap variant='B-2'>
                    {formatOption(history.subAction ?? history.action)}
                  </Typography>
                  <Typography color='text.primary' noWrap sx={{ textAlign: 'right' }} variant='B-2'>
                    {history.amount ?? '0'} {history.token ?? ''}
                  </Typography>
                </Stack>
                <Typography color='text.secondary' noWrap sx={{ textAlign: 'left' }} variant='B-5'>
                  {formatTimestamp(history.date)}
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}

export default memo(DetailPanel);
