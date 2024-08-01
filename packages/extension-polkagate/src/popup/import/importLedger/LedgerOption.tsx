// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React from 'react';

import { Infotip, Warning } from '../../../components';
import { pgBoxShadow } from '../../../util/utils';

interface OptionProps {
  title: string;
  text?: string;
  subTitle?: string;
  onClick: () => void;
  style?: SxProps<Theme> | undefined;
  warningText?: string;
  helperText?: string;
  tipPlace?: string;
  noToolTip?: boolean;
  showQuestionMark?: boolean;
  logo?: unknown;
  rotations?: SxProps<Theme>;
}

export default function LedgerOption ({ helperText, logo, noToolTip, onClick, rotations, showQuestionMark, style, subTitle, text, tipPlace, title, warningText }: OptionProps): React.ReactElement {
  const theme = useTheme();

  return (
    <Grid alignItems='center' container justifyContent='center' onClick={onClick} sx={{ backgroundColor: 'background.paper', border: '1px solid', borderColor: 'secondary.main', borderRadius: '5px', boxShadow: pgBoxShadow(theme), cursor: 'pointer', p: '10px 14px', pl: 0, ...style }}>
      <Grid alignItems='center' container item justifyContent='center' mr='7px' xs={2}>
        {logo as any}
      </Grid>
      <Grid item xs>
        <Typography color='secondary.light' fontSize='22px' fontWeight={500}>
          {title}
        </Typography>
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
          <Grid item pt='5px' width='fit-content'>
            <Infotip iconLeft={4} iconTop={1} placement={tipPlace as any} showQuestionMark={!noToolTip && showQuestionMark} text={helperText}>
              <Typography fontSize='14px' fontWeight={300}>
                {text}
              </Typography>
            </Infotip>
          </Grid>
        }
        {subTitle &&
          <Grid container item justifyContent='flex-start' pt='10px'>
            <Typography fontSize='14px' fontWeight={400}>
              {subTitle}
            </Typography>
          </Grid>}
      </Grid>
      <Grid alignItems='center' container item justifyContent='center' xs={1}>
        <ArrowForwardIosIcon
          sx={{
            color: 'secondary.light',
            fontSize: 36,
            stroke: theme.palette.secondary.light,
            strokeWidth: '1.5px',
            ...rotations
          }}
        />
      </Grid>
    </Grid>
  );
}
