// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import { Button, Grid, useTheme } from '@mui/material';
// @ts-ignore
import { Circle } from 'better-react-spinkit';
import React from 'react';

import { useTranslation } from '../hooks';

interface Props {
  text: string;
  _onClick: React.MouseEventHandler<HTMLButtonElement>;
  _onClickCancel?: React.MouseEventHandler<HTMLButtonElement>;
  cancelText?: string;
  _mt?: string;
  disabled?: boolean;
  _isBusy?: boolean;
}

export default function ButtonWithCancel({ _isBusy, _mt, _onClick, _onClickCancel, cancelText, disabled = false, text }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Grid container justifyContent='space-between' margin='auto' ml='6%' mt={_mt} sx={{ bottom: _mt ? 0 : '25px', position: _mt ? 'inherit' : 'absolute' }} width='88%'>
      <Grid item xs={5.8}>
        <Button
          onClick={_onClickCancel}
          sx={{
            color: 'primary.main',
            fontSize: '18px',
            fontWeight: 400,
            height: '36px',
            textDecorationLine: 'underline',
            textTransform: 'none',
            width: '100%'
          }}
          variant='text'
        >
          {cancelText || t<string>('Cancel')}
        </Button>
      </Grid>
      <Grid item xs={5.8}>
        {_isBusy
          ? <Grid alignItems='center' container justifyContent='center' sx={{ backgroundColor: 'secondary.main', border: '1px solid', borderColor: 'secondary.main', borderRadius: '5px', fontSize: '18px', fontWeight: 400, height: '36px', textTransform: 'none', width: '100%' }}>
            <Circle color='white' scaleEnd={0.7} scaleStart={0.4} size={25} />
          </Grid>
          : <Button
            disabled={disabled}
            onClick={_onClick}
            sx={{
              borderColor: 'secondary.main',
              borderRadius: '5px',
              color: theme.palette.mode === 'dark' ? 'text.primary' : 'text.secondary',
              fontSize: '18px',
              fontWeight: 400,
              height: '36px',
              textTransform: 'none',
              width: '100%'
            }}
            variant='contained'
          >
            {text}
          </Button>
        }
      </Grid>
    </Grid>
  );
}
