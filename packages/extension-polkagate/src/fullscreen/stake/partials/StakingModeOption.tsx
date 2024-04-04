// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Grid, SxProps, Theme, Typography, useTheme } from '@mui/material';
import React from 'react';

import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';

import { Infotip, ShowBalance, Warning } from '../../../components';

interface OptionProps {
  api?: ApiPromise;
  balance?: BN;
  title: string;
  text?: string;
  balanceText?: string;
  onClick: () => void;
  style?: SxProps<Theme> | undefined;
  warningText?: string;
  helperText?: string;
  tipPlace?: string;
  noToolTip?: boolean;
  showQuestionMark?: boolean;
  logo?: any;
  rotations?: any;
}

export default function StakingModeOption ({ api, balance, balanceText, helperText, logo, noToolTip, onClick, rotations, showQuestionMark, style, text, tipPlace, title, warningText }: OptionProps): React.ReactElement {
  const theme = useTheme();

  return (
    <Grid alignItems='center' container justifyContent='center' sx={{ backgroundColor: 'background.paper', border: `${theme.palette.mode === 'light' ? 0 : 1}px solid`, borderColor: 'secondary.main', borderRadius: '5px', p: '10px 14px', ...style }}>
      <Grid item mr='7px' xs={1.3}>
        {logo}
      </Grid>
      <Grid item xs>
        <Typography color='secondary.light' fontSize='22px' fontWeight={500}>
          {title}
        </Typography>
        {warningText &&
        <Grid container item justifyContent='center' sx={{ '> div': { mt: '5px' } }}>
          <Warning
            fontWeight={400}
            isDanger
            theme={theme}
          >
            {warningText}
          </Warning>
        </Grid>
        }
        {text &&
        <Grid item pt='5px' width='fit-content'>
          <Infotip iconLeft={4} iconTop={1} placement={tipPlace} showQuestionMark={!noToolTip && showQuestionMark} text={helperText}>
            <Typography fontSize='14px' fontWeight={300}>
              {text}
            </Typography>
          </Infotip>
        </Grid>
        }
        {balanceText &&
        <Grid container item justifyContent='flex-start' pt='10px'>
          <Grid item mr='10px'>
            <Typography fontSize='14px' fontWeight={400}>
              {balanceText}
            </Typography>
          </Grid>
          <Grid item sx={{ fontSize: '14px', fontWeight: 400 }}>
            <ShowBalance
              api={api}
              balance={balance}
            />
          </Grid>
        </Grid>}
      </Grid>
      <Grid item xs={1}>
        <ArrowForwardIosIcon
          onClick={onClick}
          sx={{
            color: 'secondary.light',
            cursor: 'pointer',
            fontSize: 36,
            stroke: theme.palette.secondary.light,
            strokeWidth: 1,
            ...rotations
          }}
        />
      </Grid>
    </Grid>
  );
}
