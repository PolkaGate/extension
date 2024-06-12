// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Popover, Typography, useTheme } from '@mui/material';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { getStorage } from '../../../components/Loading';
import CurrencySwitch from '../components/CurrencySwitch';

export interface CurrencyItemType { code: string; country: string; currency: string; sign: string; }

export default function Currency(): React.ReactElement {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [currencyToShow, setCurrencyToShow] = useState<string | undefined>();

  const textColor = useMemo(() => theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.text.secondary, [theme.palette.mode, theme.palette.text.primary, theme.palette.text.secondary]);

  useLayoutEffect(() => {
    if (currencyToShow) {
      return;
    }

    getStorage('currency').then((res) => {
      setCurrencyToShow((res as CurrencyItemType)?.sign || '$');
    }).catch(console.error);
  }, [currencyToShow]);

  const onCurrencyClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <Grid alignItems='center' aria-describedby={id} component='button' container direction='column' item justifyContent='center' onClick={onCurrencyClick} sx={{ bgcolor: 'transparent', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', cursor: 'pointer', height: '42px', minWidth: '42px', p: '2px 6px', position: 'relative', width: 'fit-content' }}>
        <Typography color={textColor} fontSize='25px' fontWeight={600}>
          {currencyToShow}
        </Typography>
      </Grid>
      <Popover
        PaperProps={{
          sx: { backgroundImage: 'none', bgcolor: 'background.paper', border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'secondary.main' : 'transparent', borderRadius: '7px', boxShadow: theme.palette.mode === 'dark' ? '0px 4px 4px rgba(255, 255, 255, 0.25)' : '0px 0px 25px 0px rgba(0, 0, 0, 0.50)', pt: '5px' }
        }}
        anchorEl={anchorEl}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom'
        }}
        id={id}
        onClose={handleClose}
        open={open}
        sx={{ mt: '5px' }}
        transformOrigin={{
          horizontal: 'right',
          vertical: 'top'
        }}
      >
        <CurrencySwitch
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          setCurrencyToShow={setCurrencyToShow}
        />
      </Popover>
    </>
  );
}
