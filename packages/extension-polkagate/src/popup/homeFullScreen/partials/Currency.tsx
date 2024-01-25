// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faColonSign, faDollarSign, faEuroSign } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, Popover, Typography, useTheme } from '@mui/material';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';

export default function Currency(): React.ReactElement {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [currencyToShow, setCurrencyToShow] = useState<string>();

  const currencyList = useMemo(() => (['Dollar', 'Euro', 'Token']), []);

  useLayoutEffect(() => {
    if (currencyToShow) {
      return;
    }

    const selectedCurrency = window.localStorage.getItem('currency');

    setCurrencyToShow(selectedCurrency ?? 'Dollar');
  }, [currencyToShow]);

  const onCurrencyClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const changeCurrency = useCallback((currency: string) => {
    setAnchorEl(null);

    setCurrencyToShow(currency);
    window.localStorage.setItem('currency', currency);
  }, []);

  const currencyIcon = useCallback((item: string | undefined) => {
    let icon;

    switch (item) {
      case 'Dollar':
        icon = faDollarSign;
        break;
      case 'Euro':
        icon = faEuroSign;
        break;

      default:
        icon = faColonSign;
        break;
    }

    return icon;
  }, []);

  const CurrencyList = () => (
    <Grid container item sx={{ maxHeight: '550px', overflow: 'hidden', overflowY: 'scroll', width: '200px' }}>
      {currencyList.map((item, index) => {
        const selectedCurrency = item === currencyToShow;

        return (
          // eslint-disable-next-line react/jsx-no-bind
          <Grid alignItems='center' container key={index} onClick={() => changeCurrency(item)} sx={{ ':hover': { bgcolor: theme.palette.mode === 'light' ? 'rgba(24, 7, 16, 0.1)' : 'rgba(255, 255, 255, 0.1)' }, bgcolor: selectedCurrency ? 'rgba(186, 40, 130, 0.2)' : 'transparent', cursor: 'pointer', height: '45px', px: '15px' }}>
            <Grid alignItems='center' container item xs={2}>
              <FontAwesomeIcon
                color={theme.palette.text.primary}
                fontSize='22px'
                icon={currencyIcon(item)}
              />
            </Grid>
            <Typography fontSize='16px' fontWeight={item ? 500 : 400}>
              {item}
            </Typography>
          </Grid>
        );
      })}
    </Grid>
  );

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <Grid alignItems='center' aria-describedby={id} component='button' container direction='column' item justifyContent='center' onClick={onCurrencyClick} sx={{ bgcolor: 'transparent', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', cursor: 'pointer', p: '2px 6px', position: 'relative', width: '42px' }}>
        <FontAwesomeIcon
          color='#fff'
          fontSize='24px'
          icon={currencyIcon(currencyToShow)}
        />
      </Grid>
      <Popover
        PaperProps={{
          sx: { backgroundImage: 'none', bgcolor: 'background.paper', border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'secondary.main' : 'transparent', borderRadius: '7px', boxShadow: theme.palette.mode === 'dark' ? '0px 4px 4px rgba(255, 255, 255, 0.25)' : '0px 0px 25px 0px rgba(0, 0, 0, 0.50)', py: '5px' }
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
        <CurrencyList />
      </Popover>
    </>
  );
}
