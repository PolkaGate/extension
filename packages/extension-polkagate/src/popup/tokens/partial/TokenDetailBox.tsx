// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { Grid, styled, Typography, useTheme } from '@mui/material';
import { type Icon, InfoCircle } from 'iconsax-react';
import React, { memo, useCallback, useMemo } from 'react';

import { calcPrice } from '@polkadot/extension-polkagate/src/util';
import { BN_ZERO } from '@polkadot/util';

import { MyTooltip } from '../../../components';
import { useIsDark, usePrices } from '../../../hooks';
import { ColumnAmounts } from './ColumnAmounts';

interface TokenDetailBoxProp {
  Icon: Icon;
  iconVariant?: 'Bulk' | 'Linear' | 'Outline' | 'Broken' | 'Bold' | 'TwoTone' | undefined;
  amount: BN | undefined;
  background?: string;
  decimal: number | undefined;
  description?: React.ReactNode;
  iconSize?: string | number;
  onClick?: () => void;
  priceId: string | undefined;
  title: string;
  token: string | undefined;
}
const DISABLED_COLOR = '#674394'; // should be added to theme

const TokenDetailBoxContainer = styled(Grid, {
  shouldForwardProp: (prop) => prop !== 'background' && prop !== 'clickable' && prop !== 'hoverbackground'
})(({ background, clickable, hoverbackground }: { background: string, clickable: boolean, hoverbackground: string }) => ({
  ':hover': clickable
    ? {
      background: hoverbackground,
      transform: 'translateY(-4px)'
    }
    : {},
  background,
  borderRadius: '14px',
  cursor: clickable ? 'pointer' : 'default',
  display: 'grid',
  flex: 1,
  padding: '12px',
  rowGap: '8px',
  transition: 'all 250ms ease-out'
}));

function TokenDetailBox({ Icon, amount, background = '#2D1E4A4D', decimal, description, iconSize = '21', iconVariant, onClick, priceId, title, token }: TokenDetailBoxProp) {
  const theme = useTheme();
  const isDark = useIsDark();
  const pricesInCurrency = usePrices();

  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);
  const totalBalance = useMemo(() => calcPrice(priceOf(priceId ?? '0'), amount ?? BN_ZERO, decimal ?? 0), [amount, decimal, priceId, priceOf]);
  const clickable = !!onClick;
  const resolvedBackground = background === '#2D1E4A4D' ? (isDark ? '#2D1E4A4D' : '#FFFFFF') : background;
  const hoverBackground = isDark ? '#2D1E4A' : '#EEF1FF';
  const accentColor = isDark ? '#AA83DC' : theme.palette.text.highlight;
  const disabledColor = isDark ? DISABLED_COLOR : theme.palette.text.secondary;

  return (
    <>
      <TokenDetailBoxContainer background={resolvedBackground} clickable={clickable} hoverbackground={hoverBackground} onClick={onClick}>
        <Grid container direction='column' gap='8px' item>
          <Icon color={clickable ? accentColor : disabledColor} size={iconSize} variant={iconVariant ?? 'Bulk'} />
          <Grid alignItems='center' container item sx={{ columnGap: '6px', flexWrap: 'nowrap' }}>
            <Typography color={clickable ? 'text.secondary' : disabledColor} sx={{ textWrap: 'nowrap' }} variant='B-1'>
              {title}
            </Typography>
            {description &&
              <MyTooltip
                content={description}
              >
                <InfoCircle color={clickable ? accentColor : disabledColor} size='19' variant='Bold' />
              </MyTooltip>
            }
          </Grid>
        </Grid>
        <ColumnAmounts
          color={clickable ? undefined : disabledColor}
          cryptoAmount={amount ?? BN_ZERO}
          decimal={decimal ?? 0}
          fiatAmount={totalBalance}
          token={token ?? ''}
        />
      </TokenDetailBoxContainer>
    </>
  );
}

export default memo(TokenDetailBox);
