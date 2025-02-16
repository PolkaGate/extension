// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container, Skeleton, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowDown2, ArrowUp2 } from 'iconsax-react';
import React, { memo, useMemo } from 'react';

import { FormatPrice } from '../../../components';
import { PORTFOLIO_CHANGE_DECIMAL } from '../../../fullscreen/homeFullScreen/partials/TotalBalancePieChart';
import { useIsHideNumbers, useYouHave2 } from '../../../hooks';
import { COIN_GECKO_PRICE_CHANGE_DURATION } from '../../../util/api/getPrices';
import { formatDecimal } from '../../../util/utils';

const RenderSkeleton = memo(function RenderSkeleton () {
  return (
    <Skeleton
      animation='wave'
      height='20px'
      sx={{ borderRadius: '50px', fontWeight: 'bold', transform: 'none', width: '122px' }}
      variant='text'
    />
  );
});

interface DailyChangeProps {
  change?: number | null;
  style?: SxProps<Theme>;
  textVariant?: string;
  iconSize?: number;
  showHours?: boolean;
  showPercentage?: boolean;
}

function DailyChange ({ change = null, iconSize = 15, showHours = true, showPercentage, style, textVariant = 'B-1' }: DailyChangeProps): React.ReactElement {
  const theme = useTheme();
  const youHave = useYouHave2();
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
      ? '#FF165C26'
      : changed && changed > 0
        ? '#82FFA526'
        : '#AA83DC26',
    borderRadius: '9px',
    columnGap: '3px',
    display: 'flex',
    m: 0,
    p: '3px 6px',
    width: 'fit-content'
  };

  const color = useMemo(() => !changed ? '#AA83DC' : changed > 0 ? '#82FFA5' : '#FF165C', [changed]);

  if (changed === undefined) {
    return <RenderSkeleton />;
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
