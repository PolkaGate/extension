// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-max-props-per-line */

import { Button, Grid, useTheme } from '@mui/material';
// @ts-ignore
import { Circle } from 'better-react-spinkit';
import React from 'react';

import { useTranslation } from '../hooks';

interface Props {
  primaryBtnText: string;
  onPrimaryClick: React.MouseEventHandler<HTMLButtonElement>;
  secondaryBtnText?: string;
  onSecondaryClick: React.MouseEventHandler<HTMLButtonElement>;
  primaryBtnStartIcon?: React.JSX.Element;
  secondaryBtnStartIcon?: React.JSX.Element;
  mt?: string;
  ml?: string;
  disabled?: boolean;
  isBusy?: boolean;
  variant?: 'text' | 'outlined';
  width?: string;
}
// TODO: can replace ButtonWithCancel later

export default function TwoButtons({ disabled = false, isBusy = false, ml = '6%', mt, onPrimaryClick, onSecondaryClick, primaryBtnStartIcon, primaryBtnText, secondaryBtnStartIcon, secondaryBtnText, variant = 'outlined', width = '88%' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Grid container justifyContent='space-between' margin='auto' ml={ml} mt={mt} sx={{ bottom: mt ? 0 : '25px', position: mt ? 'inherit' : 'absolute' }} width={width}>
      <Grid item xs={5.8}>
        <Button
          disabled={isBusy}
          onClick={onSecondaryClick}
          startIcon={secondaryBtnStartIcon}
          sx={{
            borderColor: 'secondary.light',
            color: variant === 'text' ? 'secondary.light' : 'text.primary',
            fontSize: '18px',
            fontWeight: 400,
            height: '36px',
            px: 0,
            textDecorationLine: variant === 'text' ? 'underline' : 'none',
            textTransform: 'none',
            width: '100%'
          }}
          variant={variant}
        >
          {secondaryBtnText || t<string>('Cancel')}
        </Button>
      </Grid>
      <Grid item xs={5.8}>
        {isBusy
          ? <Grid alignItems='center' aria-label='primaryBusyButton' container justifyContent='center' role='button' sx={{ backgroundColor: 'secondary.main', border: '1px solid', borderColor: 'secondary.main', borderRadius: '5px', fontSize: '18px', fontWeight: 400, height: '36px', textTransform: 'none', width: '100%' }}>
            <Circle color='white' scaleEnd={0.7} scaleStart={0.4} size={25} />
          </Grid>
          : <Button
            disabled={disabled}
            onClick={onPrimaryClick}
            startIcon={primaryBtnStartIcon}
            sx={{
              borderColor: 'secondary.main',
              borderRadius: '5px',
              color: theme.palette.mode === 'dark' ? 'text.primary' : 'text.secondary',
              fontSize: '18px',
              fontWeight: 400,
              height: '36px',
              px: 0,
              textTransform: 'none',
              width: '100%'
            }}
            variant='contained'
          >
            {primaryBtnText}
          </Button>
        }
      </Grid>
    </Grid>
  );
}
