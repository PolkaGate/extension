// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IconProp } from '@fortawesome/fontawesome-svg-core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowBackIos as ArrowBackIosIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { } from 'react';

interface TitleProps {
  height?: string;
  text: string;
  icon?: IconProp;
  logo?: unknown;
  ml?: string;
  padding?: string;
  onBackClick?: () => void;
  spacing?: number;
}

export const Title = ({ height, icon, logo, ml, onBackClick, padding = '30px 0px 30px', spacing = 1, text }: TitleProps): React.ReactElement => {
  const theme = useTheme();

  return (
    <Grid alignItems={'center'} container height={height || '113px'} item ml={ml} p={padding} spacing={spacing}>
      {!!onBackClick &&
        <Grid item width='fit-content'>
          <ArrowBackIosIcon
            onClick={onBackClick}
            sx={{
              ':hover': { opacity: 1 },
              color: 'secondary.light',
              cursor: 'pointer',
              fontSize: 36,
              opacity: 0.5,
              stroke: theme.palette.secondary.light,
              strokeWidth: 1
            }}
          />
        </Grid>
      }
      <Grid item>
        {icon &&
          <FontAwesomeIcon
            color={theme.palette.text.primary}
            icon={icon}
            size='xl'
            style={{ paddingBottom: '5px' }}
          />
        }
        {logo as any}
      </Grid>
      <Grid item>
        <Typography fontSize='24px' fontWeight={700}>
          {text}
        </Typography>
      </Grid>
    </Grid>
  );
};
