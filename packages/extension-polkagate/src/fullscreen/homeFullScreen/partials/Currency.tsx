// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Popover, Typography, useTheme } from '@mui/material';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import Infotip2 from '../../../components/Infotip2';
import { getStorage } from '../../../components/Loading';
import { HEADER_COMPONENT_STYLE } from '../../governance/FullScreenHeader';
import CurrencySwitch from '../components/CurrencySwitch';

export interface CurrencyItemType {
  code: string;
  country: string;
  currency: string;
  sign: string;
}

interface Props {
  fontSize?: string;
  color?: string;
  bgcolor?: string;
  height?: string;
  minWidth?: string;
  noBorder?: boolean;
}

export default function Currency ({ bgcolor, color, fontSize = '22px', height, minWidth, noBorder }: Props): React.ReactElement {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [currencyToShow, setCurrencyToShow] = useState<CurrencyItemType | undefined>();

  const textColor = useMemo(() => color || (theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.text.secondary), [color, theme]);

  useLayoutEffect(() => {
    if (currencyToShow) {
      return;
    }

    getStorage('currency').then((res) => {
      setCurrencyToShow((res as CurrencyItemType));
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
      <Grid alignItems='center' aria-describedby={id} component='button' container direction='column' item justifyContent='center' onClick={onCurrencyClick} 
      // eslint-disable-next-line sort-keys
        sx={{ ...HEADER_COMPONENT_STYLE, border: noBorder ? 0 : HEADER_COMPONENT_STYLE?.border, bgcolor: bgcolor || HEADER_COMPONENT_STYLE?.bgcolor, height: height || HEADER_COMPONENT_STYLE?.height, minWidth: minWidth || HEADER_COMPONENT_STYLE?.minWidth }}>
        <Infotip2 text={currencyToShow?.currency}>
          <Typography color={textColor} fontSize={ fontSize } fontWeight={500}>
            {currencyToShow?.sign || '$'}
          </Typography>
        </Infotip2>
      </Grid>
      <Popover
        PaperProps={{
          sx: { backgroundImage: 'none', bgcolor: 'background.paper', border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'secondary.light' : 'transparent', borderRadius: '7px', boxShadow: theme.palette.mode === 'dark' ? '0px 4px 4px rgba(255, 255, 255, 0.25)' : '0px 0px 25px 0px rgba(0, 0, 0, 0.50)', pt: '5px' }
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
