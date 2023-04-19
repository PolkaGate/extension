// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Grid, Typography, useTheme } from '@mui/material';
import React from 'react';
import ReactMarkdown from 'react-markdown';

import { Identity } from '../../../components';
import { useApi, useChain } from '../../../hooks';
import { CommentType } from '../utils/types';
import { formatRelativeTime } from '../utils/util';

export default function Comment({ address, comment, noSource }: { address: string, comment: CommentType, noSource?: boolean }): React.ReactElement {
  const theme = useTheme();
  const api = useApi(address);
  const chain = useChain(address);

  return (
    <Grid alignItems='center' container item spacing={2} sx={{ mb: '10px' }}>
      <Grid item>
        <Identity address={comment.proposer} api={api} chain={chain} identiconSize={25} showAddress showSocial={false} style={{ fontSize: '14px', fontWeight: 400, lineHeight: '47px', maxWidth: '100%', minWidth: '35%', width: 'fit-content' }} />
      </Grid>
      <Grid item sx={{ fontSize: '16px', color: 'text.disabled' }}>
        {formatRelativeTime(comment.created_at)}
      </Grid>
      {!noSource &&
        <Grid item>
          <Typography sx={{ textAlign: 'center', fontSize: '14px', fontWeight: 400, border: `0.01px solid ${theme.palette.text.disabled}`, borderRadius: '30px', p: '0 10px' }}>
            {'Polkassembly'}
          </Typography>
        </Grid>
      }
      <Grid item xs={12} sx={{ pl: '25px' }}>
        {comment?.content &&
          <ReactMarkdown
            components={{ img: ({ node, ...props }) => <img style={{ maxWidth: '100%' }}{...props} /> }}
            children={comment?.content}
          />
        }
      </Grid>
    </Grid>
  );
}
