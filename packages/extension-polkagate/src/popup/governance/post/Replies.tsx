// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Grid, useTheme } from '@mui/material';
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
      <Grid alignItems='center' container justifyContent='flex-start' spacing={2}>
        <Grid item>
          {t('Hide Replies ({{count}})', { replace: { count: replies.length } })}
        </Grid>
        <Grid item>
          <ExpandMoreIcon
            onClick={() => setExpanded(!expanded)}
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
