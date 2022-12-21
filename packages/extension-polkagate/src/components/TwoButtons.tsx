// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Grid, useTheme } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React from 'react';

import { useTranslation } from '../hooks';

interface Props {
  primaryBtnText: string;
  onPrimaryClick: React.MouseEventHandler<HTMLButtonElement>;
  secondaryBtnText?: string;
  onSecondaryClick?: React.MouseEventHandler<HTMLButtonElement>;
  mt?: string;
  disabled?: boolean;
  isBusy?: boolean;
  variant?: 'text' | 'outlined';
}
// TODO: can replace ButtonWithCancel later

export default function TwoButtons({ disabled = false, isBusy, mt, onPrimaryClick, onSecondaryClick, primaryBtnText, secondaryBtnText, variant = 'outlined' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Grid container justifyContent='space-between' margin='auto' ml='6%' mt={mt} sx={{ bottom: mt ? 0 : '25px', position: mt ? 'inherit' : 'absolute' }} width='88%'>
      <Grid item xs={5.8}>
        <Button
          onClick={onSecondaryClick}
          sx={{
            borderColor: 'secondary.main',
            color: variant === 'text' ? 'secondary.main' : 'text.primary',
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
      <Grid item xs={5.8} >
        {/* {isBusy
          ? <Grid container justifyContent='center' alignItems='center'
            sx={{
              border: '1px solid',
              borderColor: 'secondary.main',
              borderRadius: '5px',
              backgroundColor: 'secondary.main',
              textTransform: 'none',
              fontSize: '18px',
              fontWeight: 400,
              height: '36px',
              textTransform: 'none',
              width: '100%'
            }}>
            <Circle color='white' scaleEnd={0.7} scaleStart={0.4} size={25} />
          </Grid>
          :  */}
        <Button
          disabled={disabled}
          onClick={onPrimaryClick}
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
          {!isBusy ? primaryBtnText : <Circle color='white' scaleEnd={0.7} scaleStart={0.4} size={25} />}
        </Button>
        {/* } */}
      </Grid>
    </Grid>
  );
}
