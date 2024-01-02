// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Grid, Typography, useTheme } from '@mui/material';
import React from 'react';

import { useTranslation } from '../../../hooks';
import { Reply } from '../utils/types';
import CommentView from './Comment';

export default function Replies({ address, replies }: { address: string | undefined, replies: Reply[] }): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Grid container sx={{ borderLeft: `2px solid ${theme.palette.text.disabled}`, mb: '20px', ml: '25px' }}>
      <Grid alignItems='center' container height='35px' justifyContent='flex-start' onClick={() => setExpanded(!expanded)}>
        <Grid item sx={{ px: '8px', width: 'fit-content' }}>
          <Typography>
            {t('({{count}}) Replies', { replace: { count: replies.length } })}
          </Typography>
        </Grid>
        <Grid item>
          <ExpandMoreIcon
            sx={{ color: `${theme.palette.primary.main}`, cursor: 'pointer', fontSize: '35px', transform: expanded ? 'rotate(180deg)' : 'none', transitionDuration: '0.3s', transitionProperty: 'transform' }}
          />
        </Grid>
      </Grid>
      {expanded && replies?.map((reply, index) => (
        <Grid container key={index} pl='5px' pt='5px'>
          <CommentView address={address} comment={reply} noSource />
        </Grid>
      ))
      }
    </Grid>
  );
}
