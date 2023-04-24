// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
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
    <Grid container sx={{ borderLeft: `2px solid ${theme.palette.text.disabled}`, pl: '20px', mb: '20px' }}>
      <Grid alignItems='flex-start' container justifyContent='flex-start' spacing={1} onClick={() => setExpanded(!expanded)}>
        <Grid item>
          {expanded
            ? <Typography>
              {t('Hide Replies ({{count}})', { replace: { count: replies.length } })}
            </Typography>
            : <Typography>
              {t('Show Replies ({{count}})', { replace: { count: replies.length } })}
            </Typography>
          }
        </Grid>
        <Grid item>
          <ExpandMoreIcon
            sx={{ color: `${theme.palette.primary.main}`, cursor: 'pointer', fontSize: '37px', transform: expanded && 'rotate(180deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }}
          />
        </Grid>
      </Grid>
      {expanded && replies?.map((reply, index) => (
        <Grid container key={index}>
          <CommentView address={address} comment={reply} noSource />
        </Grid>
      ))
      }
    </Grid>
  )
}
