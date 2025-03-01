// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Dialog, Grid, Slide, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import Infotip2 from '../../../components/Infotip2';
import { getStorage } from '../../../components/Loading';
import { HEADER_COMPONENT_STYLE } from '../../governance/FullScreenHeader';
import CurrencyList from '../components/CurrencyList';

export interface CurrencyItemType {
  code: string;
  country: string;
  currency: string;
  sign: string;
}

interface Props {
  borderColor?: string;
  color?: string;
  dialogLeft?: number;
  fontSize?: string;
  height?: string;
  minWidth?: string;
}

function Currency({ borderColor, color, dialogLeft = 260, fontSize = '22px', height, minWidth }: Props): React.ReactElement {
  const theme = useTheme();
  const ref = useRef<DOMRect>();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [currencyToShow, setCurrencyToShow] = useState<CurrencyItemType | undefined>();

  const textColor = useMemo(() => color || (theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.text.secondary), [color, theme]);

  useEffect(() => {
    if (anchorEl?.getBoundingClientRect()) {
      ref.current = anchorEl.getBoundingClientRect();
    }
  }, [anchorEl]);

  useLayoutEffect(() => {
    if (currencyToShow) {
      return;
    }

    getStorage('currency').then((res) => {
      setCurrencyToShow((res as CurrencyItemType));
    }).catch(console.error);
  }, [currencyToShow]);

  const onCurrencyClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  }, [anchorEl]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  return (
    <>
      <Grid
        alignItems='center' component='button' container direction='column' item justifyContent='center' onClick={onCurrencyClick}
        sx={{
          ...HEADER_COMPONENT_STYLE,
          borderColor: borderColor || HEADER_COMPONENT_STYLE?.borderColor,
          height: height || HEADER_COMPONENT_STYLE?.height,
          minWidth: minWidth || HEADER_COMPONENT_STYLE?.minWidth,
          zIndex: anchorEl && theme.zIndex.modal + 1
        }}
      >
        <Infotip2 text={currencyToShow?.currency}>
          <Typography color={textColor} fontSize={fontSize} fontWeight={500}>
            {currencyToShow?.sign || '$'}
          </Typography>
        </Infotip2>
      </Grid>
      <Dialog
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            borderRadius: '7px',
            boxShadow: theme.palette.mode === 'dark'
              ? '0px 4px 4px rgba(255, 255, 255, 0.25)'
              : '0px 0px 25px 0px rgba(0, 0, 0, 0.50)',
            left: ((anchorEl?.getBoundingClientRect() || ref.current)?.right ?? 0) - dialogLeft,
            position: 'absolute',
            top: ((anchorEl?.getBoundingClientRect() || ref.current)?.bottom ?? 0) - 30
          }
        }}
        TransitionComponent={Slide}
        onClose={handleClose}
        open={!!anchorEl}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)'
            }
          }
        }}
      >
        <CurrencyList
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          setCurrencyToShow={setCurrencyToShow}
        />
      </Dialog>
    </>
  );
}

export default React.memo(Currency);
