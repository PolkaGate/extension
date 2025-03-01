// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Slider, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo } from 'react';

import { useBlockInterval, useConvictionOptions, useTranslation } from '../hooks';

interface Props {
  address: string | undefined;
  children?: React.ReactElement;
  conviction: number | undefined;
  setConviction: React.Dispatch<React.SetStateAction<number | undefined>>;
  style?: SxProps<Theme> | undefined;
}

export const DEFAULT_CONVICTION = 1;

export default function Convictions({ address, children, conviction, setConviction, style }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const blockTime = useBlockInterval(address);
  const convictionOptions = useConvictionOptions(address, blockTime);

  const onChangeConviction = useCallback((_event: Event, newValue: number | number[], _activeThumb: number): void => {
    setConviction(newValue as number);
  }, [setConviction]);

  const { max, min } = useMemo(() => {
    const min = (convictionOptions?.[0]?.value || 0) as number;
    const max = (convictionOptions?.[convictionOptions.length - 1]?.value || min) as number;

    return { max, min };
  }, [convictionOptions]);

  const info = useMemo((): string => {
    const newText = convictionOptions?.find(({ value }) => value === (conviction || DEFAULT_CONVICTION))?.text;
    const match = newText?.match(/\(([^)]+)\)/);

    return match ? match[1] : '0 days';
  }, [conviction, convictionOptions]);

  const marks = useMemo(() =>
    convictionOptions?.map(({ value }) => ({ label: `${value} X`, value: value as number }))
    , [convictionOptions]);

  const valuetext = useCallback((value: number) => {
    return `${value} X`;
  }, []);

  useEffect(() => {
    // Select all mark labels and apply styles based on slider value
    const markLabels = document.querySelectorAll('.MuiSlider-markLabel');

    convictionOptions && markLabels.forEach((label, index) => {
      const markValue = convictionOptions[index]?.value as number | undefined;

      if (markValue && conviction && markValue > conviction) {
        (label as HTMLElement).style.color = theme.palette.text.disabled; // Untraversed color
      } else {
        (label as HTMLElement).style.color = theme.palette.text.primary;
      }
    });
  }, [conviction, convictionOptions, theme]);

  return (
    <Grid alignContent='flex-start' alignItems='flex-start' container justifyContent='flex-start' sx={{ '> div div div': { fontSize: '16px', fontWeight: 400 }, position: 'relative', ...style }}>
      <Typography sx={{ fontSize: '16px' }}>
        {t('Vote Multiplier')}
      </Typography>
      <Slider
        aria-label='Vote Convictions'
        defaultValue={conviction || DEFAULT_CONVICTION}
        disabled={!convictionOptions}
        getAriaValueText={valuetext}
        marks={marks}
        max={max}
        min={min}
        onChange={onChangeConviction}
        size='small'
        step={null}
        sx={{
          '& .MuiSlider-rail': {
            color: 'action.focus' // Non-selected track color
          },
          '& .MuiSlider-thumb': {
            color: 'primary.main' // Thumb color
          },
          '& .MuiSlider-track': {
            color: 'secondary.main' // Selected track color
          },
          mx: '10px'
        }}
        valueLabelDisplay='auto'
      />
      {children}
      <Grid alignItems='center' container item justifyContent='space-between' sx={{ pt: '10px' }}>
        <Grid item>
          <Typography sx={{ fontSize: '14px' }}>
            {t('Tokens will be locked for')}
          </Typography>
        </Grid>
        <Grid item sx={{ fontSize: '16px', fontWeight: 400 }}>
          {info}
        </Grid>
      </Grid>
    </Grid>
  );
}
