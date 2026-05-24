// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

type Direction = 'right' | 'left';

function Move({ direction, max, setMove }: { direction: Direction, max?: number, setMove: React.Dispatch<React.SetStateAction<number>> }): React.ReactElement {
  const [chevronHovered, setChevronHovered] = useState<Direction>();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const onMouseEnterChevron = useCallback((type: Direction) => {
    setChevronHovered(type);
  }, []);

  const onMouseLeaveChevron = useCallback(() => {
    setChevronHovered(undefined);
  }, []);

  const onClick = useCallback(() => {
    setMove((pre) => {
      if (!max) {
        return pre;
      }

      if (direction === 'right') {
        return pre + 1 > max ? pre : pre + 1;
      }

      return pre - 1 < 0 ? pre : pre - 1;
    }
    );
  }, [direction, max, setMove]);

  const Component = direction === 'right' ? ChevronRight : ChevronLeft;

  return (
    <Grid
      alignItems='center'
      container
      item
      justifyContent='center'
      onClick={onClick}
      // eslint-disable-next-line react/jsx-no-bind
      onMouseEnter={() => onMouseEnterChevron(direction)}
      onMouseLeave={onMouseLeaveChevron}
      sx={{
        bgcolor: chevronHovered === direction ? '#674394' : (isDark ? '#05091C' : '#FFFFFF'),
        border: `3px solid ${isDark ? '#1B133C' : '#EEF2FB'}`,
        borderRadius: '8px',
        cursor: 'pointer',
        height: '29px',
        transition: 'all 0.2s ease-in-out',
        width: '29px'
      }}>
      <Component sx={{ color: chevronHovered === direction ? '#EAEBF1' : (isDark ? '#AA83DC' : theme.palette.text.secondary), fontSize: '18px' }} />
    </Grid>
  );
}

export default React.memo(Move);
