// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, SxProps, Theme, Typography } from '@mui/material';
import React from 'react';

import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';

import { PButton, ShowBalance } from '../../../components';

interface OptionProps {
  api?: ApiPromise;
  balance?: BN;
  title: string;
  text: string;
  isDisabled?: boolean;
  isBusy?: boolean;
  buttonText: string;
  balanceText: string;
  onClick: () => void;
  style?: SxProps<Theme> | undefined;
}

export default function Option({ api, balance, buttonText, isBusy, isDisabled, balanceText, onClick, style, text, title }: OptionProps): React.ReactElement {
  return (
    <Grid
      alignItems='center'
      container
      direction='column'
      justifyContent='center'
      sx={{
        backgroundColor: 'background.paper',
        border: '0.5px solid',
        borderColor: 'secondary.main',
        borderRadius: '5px',
        letterSpacing: '-1.5%',
        p: '10px 14px',
        ...style
      }}
    >
      <Grid item>
        <Typography
          fontSize='20px'
          fontWeight={400}
        >
          {title}
        </Typography>
      </Grid>
      <Grid
        item
        pt='5px'
      >
        <Typography
          fontSize='14px'
          fontWeight={300}
        >
          {text}
        </Typography>
      </Grid>
      <Grid
        container
        item
        justifyContent='space-between'
        pt='10px'
      >
        <Grid
          item
        >
          <Typography
            fontSize='14px'
            fontWeight={300}
          >
            {balanceText}
          </Typography>
        </Grid>
        <Grid
          item
          sx={{
            fontSize: '14px',
            fontWeight: 400
          }}
        >
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
