// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { ToolTipPlacement } from '@polkadot/extension-polkagate/src/components/Infotip';
import type { BN } from '@polkadot/util';

import { Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React from 'react';

import { Infotip, PButton, ShowBalance, Warning } from '../../../components';

interface OptionProps {
  api?: ApiPromise;
  balance?: BN;
  title: string;
  text?: string;
  isDisabled?: boolean;
  isBusy?: boolean;
  buttonText: string;
  balanceText: string;
  onClick: () => void;
  style?: SxProps<Theme> | undefined;
  warningText?: string;
  helperText?: string;
  tipPlace?: string;
  noToolTip?: boolean;
  showQuestionMark?: boolean;
  logo?: any;
}

export default function StakingOption ({ api, balance, balanceText, buttonText, helperText, isBusy, isDisabled, logo, noToolTip, onClick, showQuestionMark, style, text, tipPlace, title, warningText }: OptionProps): React.ReactElement {
  const theme = useTheme();

  return (
    <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ backgroundColor: 'background.paper', border: '0.5px solid', borderColor: 'secondary.main', borderRadius: '5px', letterSpacing: '-1.5%', p: '10px 14px', ...style }}>
      <Grid alignItems='center' container item justifyContent='center'>
        {logo &&
          <Grid alignItems='center' container item mr='7px' sx={{ width: 'fit-content' }}>
            {logo}
          </Grid>
        }
        <Grid item>
          <Infotip iconLeft={6} iconTop={8} placement={tipPlace as ToolTipPlacement} showQuestionMark={!noToolTip && showQuestionMark} text={helperText}>
            <Typography fontSize='20px' fontWeight={400}>
              {title}
            </Typography>
          </Infotip>
        </Grid>
      </Grid>
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
        <Grid item pt='5px'>
          <Typography fontSize='14px' fontWeight={300}>
            {text}
          </Typography>
        </Grid>
      }
      <Grid container item justifyContent='space-between' pt='10px'>
        <Grid item>
          <Typography fontSize='14px' fontWeight={300}>
            {balanceText}
          </Typography>
        </Grid>
        <Grid item sx={{ fontSize: '14px', fontWeight: 400 }}>
          <ShowBalance
            api={api}
            balance={balance}
          />
        </Grid>
      </Grid>
      <PButton
        _isBusy={isBusy}
        _ml={0}
        _mt={'15px'}
        _onClick={onClick}
        _width={100}
        disabled={isDisabled}
        text={buttonText}
      />
    </Grid>
  );
}
