// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';

import { Grid, styled, Typography } from '@mui/material';
import { type Icon, InfoCircle } from 'iconsax-react';
import React, { memo, useCallback, useMemo, useRef } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { Tooltip } from '../../../components';
import { usePrices } from '../../../hooks';
import { calcPrice } from '../../../hooks/useYouHave';
import { ColumnAmounts } from '..';

interface TokenDetailBoxProp {
  Icon: Icon;
  title: string;
  description?: React.ReactNode;
  amount: BN | undefined;
  decimal: number | undefined;
  token: string | undefined;
  priceId: string | undefined;
  onClick?: () => void;
}

const TokenDetailBoxContainer = styled(Grid)(({ clickable }: { clickable: boolean }) => ({
  ':hover': clickable
    ? {
      background: '#2D1E4A',
      transform: 'translateY(-4px)'
    }
    : {},
  background: '#2D1E4A4D',
  borderRadius: '14px',
  cursor: clickable ? 'pointer' : 'default',
  display: 'grid',
  flex: 1,
  padding: '12px',
  rowGap: '8px',
  transition: 'all 250ms ease-out'
}));

function TokenDetailBox ({ Icon, amount, decimal, description, onClick, priceId, title, token }: TokenDetailBoxProp) {
  const pricesInCurrency = usePrices();
  const toolTipRef = useRef(null);

  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);
  const totalBalance = useMemo(() => calcPrice(priceOf(priceId ?? '0'), amount ?? BN_ZERO, decimal ?? 0), [amount, decimal, priceId, priceOf]);

  return (
    <>
      <TokenDetailBoxContainer clickable={!!onClick} onClick={onClick}>
        <Grid container direction='column' gap='8px' item>
          <Icon color='#AA83DC' size='21' variant='Bulk' />
          <Grid alignItems='center' container item sx={{ columnGap: '6px' }}>
            <Typography color='text.secondary' variant='B-1'>
              {title}
            </Typography>
            {description && <InfoCircle color='#AA83DC' ref={toolTipRef} size='19' variant='Bold' />}
          </Grid>
        </Grid>
        <ColumnAmounts
          cryptoAmount={amount ?? BN_ZERO}
          decimal={decimal ?? 0}
          fiatAmount={totalBalance}
          token={token ?? ''}
        />
      </TokenDetailBoxContainer>
      <Tooltip
        content={description}
        placement='top'
        positionAdjustment={{ top: -10 }}
        targetRef={description ? toolTipRef : null}
      />
    </>
  );
}

export default memo(TokenDetailBox);
