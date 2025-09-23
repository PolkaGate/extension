// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowDown2, ArrowUp2 } from 'iconsax-react';
import React, { useMemo } from 'react';

import { FormatPrice, MySkeleton } from '../../../components';
import { useIsDark, useIsHideNumbers, usePortfolio } from '../../../hooks';
import { COIN_GECKO_PRICE_CHANGE_DURATION } from '../../../util/api/getPrices';
import { formatDecimal } from '../../../util';

const PORTFOLIO_CHANGE_DECIMAL = 2;

interface DailyChangeProps {
  change?: number | null;
  address?: string;
  style?: React.CSSProperties;
  textVariant?: string;
  iconSize?: number;
  showHours?: boolean;
  showPercentage?: boolean;
}

function DailyChange ({ address, change = null, iconSize = 15, showHours = true, showPercentage, style = {}, textVariant = 'B-1' }: DailyChangeProps): React.ReactElement {
  const theme = useTheme();
  const isDark = useIsDark();
  const youHave = usePortfolio(address);
  const { isHideNumbers } = useIsHideNumbers();

  const changed = useMemo(() => {
    if (change !== null) {
      return change;
    }

    if (youHave?.change === undefined) {
      return undefined;
    }

    const isNegative = youHave.change < 0;
    const value = formatDecimal(youHave.change, PORTFOLIO_CHANGE_DECIMAL, false, true);

    return isNegative
      ? -parseFloat(value)
      : parseFloat(value);
  }, [change, youHave?.change]);

  const containerStyle: SxProps<Theme> = {
    alignItems: 'center',
    bgcolor: changed && changed < 0
      ? isDark ? '#FF165C26' : '#FF165C33'
      : changed && changed > 0
        ? isDark ? '#82FFA526' : '#00E29E33'
        : isDark ? '#AA83DC26' : '#8F97B826',
    borderRadius: '9px',
    columnGap: '3px',
    display: 'flex',
    m: 0,
    p: '3px 6px',
    width: 'fit-content'
  };

  const color = useMemo(() =>
    !changed
      ? '#AA83DC'
      : changed > 0
        ? isDark ? '#82FFA5' : '#00CA8D'
        : '#FF165C'
  , [changed, isDark]);

  if (changed === undefined) {
    return (<MySkeleton height={20} style={{ background: '#BEAAD826', width: style?.minWidth ?? '122px' }} />);
  }

  return (
    <Container disableGutters sx={{ ...containerStyle, ...style }}>
      {!changed
        ? null
        : changed > 0
          ? <ArrowUp2 color={color} size={iconSize} variant='Bold' />
          : <ArrowDown2 color={color} size={iconSize} variant='Bold' />
      }
      {showPercentage
        ? <Typography color={color} variant='B-4'>
          {Math.abs(changed).toFixed(2)}%
        </Typography>
        : <FormatPrice
          commify
          num={changed}
          skeletonHeight={14}
          textColor={color}
          width='fit-content'
          {...(theme.typography[textVariant as never] as object)}
        />
      }
      {showHours && !isHideNumbers &&
        <Typography style={{ color, fontWeight: 900, lineHeight: '15px' }} variant={textVariant as never}>
          •
        </Typography>}
      {showHours &&
        <Typography style={{ color, lineHeight: '15px' }} variant={textVariant as never}>
          {`${COIN_GECKO_PRICE_CHANGE_DURATION}h`}
        </Typography>
      }
    </Container>
  );
}

export default DailyChange;
