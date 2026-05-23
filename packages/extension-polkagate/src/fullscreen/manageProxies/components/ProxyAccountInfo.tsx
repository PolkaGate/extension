// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ProxyItem } from '../../../util/types';

import { Grid, Stack, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import React, { useCallback, useEffect, useState } from 'react';

import useAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import PolkaGateIdenticon from '@polkadot/extension-polkagate/src/style/PolkaGateIdenticon';
import { toShortAddress } from '@polkadot/extension-polkagate/src/util';
import { toTitleCase } from '@polkadot/extension-polkagate/src/util/string';

import { GlowCheckbox, Identity } from '../../../components';
import { useTranslation } from '../../../components/translate';

interface Props {
  handleDelete: (proxyItem: ProxyItem) => void;
  showCheck?: boolean;
  proxyItem: ProxyItem;
  style?: SxProps<Theme>;
}

function Info({ isDark, label, value }: { isDark: boolean; label: string; value: string; }): React.ReactElement {
  const theme = useTheme();

  return (
    <Stack columnGap='5px' direction='row' sx={{ bgcolor: isDark ? '#C6AECC26' : '#EAE4F5', borderRadius: '9px', lineHeight: '24px', px: '5px' }}>
      <Typography color={theme.palette.accent.icon} variant='B-1'>
        {label}:
      </Typography>
      <Typography color={theme.palette.accent.text} variant='B-1'>
        {value}
      </Typography>
    </Stack>
  );
}

export default function ProxyAccountInfo({ handleDelete, proxyItem, showCheck = true, style = {} }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const genesisHash = useAccountSelectedChain(proxyItem.proxy.delegate);

  const [selected, setSelected] = useState(proxyItem.status === 'remove');

  const cardBackground = selected
    ? isDark
      ? 'linear-gradient(#05091C, #05091C) padding-box, linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%) border-box'
      : 'linear-gradient(#FFFFFF, #FFFFFF) padding-box, linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%) border-box'
    : isDark ? '#05091C' : '#FFFFFF';
  const cardBorder = selected ? '2px solid transparent' : `1px solid ${isDark ? '#2D1E4A' : '#E3E8F7'}`;
  const primaryTextColor = isDark ? '#EAEBF1' : theme.palette.text.primary;
  const delayColor = isDark ? '#82FFA5' : '#14B874';
  const delayBg = isDark ? '#82FFA526' : '#DDF8EA';

  useEffect(() => {
    setSelected(proxyItem.status === 'remove');
  }, [proxyItem.status]);

  const handleCheck = useCallback((checked: boolean) => {
    handleDelete(proxyItem);
    setSelected(checked);
  }, [handleDelete, proxyItem]);

  return (
    <Grid
      alignItems='center' columnGap='15px' container item sx={{
        background: cardBackground,
        bgcolor: isDark ? '#05091C' : '#FFFFFF',
        border: cardBorder,
        borderRadius: '14px',
        boxShadow: isDark ? 'none' : '0 10px 22px rgba(106, 116, 156, 0.12)',
        flexWrap: 'nowrap',
        height: '90px',
        maxWidth: '423px',
        minWidth: '379px',
        p: '0 5px 0 20px',
        position: 'relative',
        width: 'fit-content',
        ...style
      }}
    >
      <PolkaGateIdenticon
        address={proxyItem.proxy.delegate}
        size={36}
      />
      <Stack direction='column' rowGap='4px'>
        <Stack alignItems='center' columnGap='8px' direction='row'>
          <Identity
            address={proxyItem.proxy.delegate}
            genesisHash={genesisHash ?? POLKADOT_GENESIS}
            noIdenticon
            style={{ color: primaryTextColor, maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', variant: 'B-1' }}
          />
          <Typography color={delayColor} sx={{ bgcolor: delayBg, borderRadius: '7px', px: '4px' }} variant='B-5'>
            {proxyItem.proxy.delay * 6} sec
          </Typography>
        </Stack>
        <Stack columnGap='5px' direction='row'>
          <Info
            isDark={isDark}
            label={t('Type')}
            value={toTitleCase(proxyItem.proxy.proxyType) ?? ''}
          />
          <Info
            isDark={isDark}
            label={t('Address')}
            value={toShortAddress(proxyItem.proxy.delegate, 4)}
          />
        </Stack>
      </Stack>
      {
        showCheck &&
        <GlowCheckbox
          changeState={handleCheck}
          checked={selected}
          style={{ left: '350px', position: 'absolute', top: '8px' }}
        />
      }
    </Grid>
  );
}
