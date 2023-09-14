// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ThumbDown as ThumbDownIcon, ThumbUp as ThumbUpIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

import { Identity, Infotip2 } from '../../../components';
import { useApi, useChain } from '../../../hooks';
import { CommentType } from '../utils/types';
import { formatRelativeTime } from '../utils/util';

export default function Comment({ address, comment, noSource }: { address: string, comment: CommentType, noSource?: boolean }): React.ReactElement {
  const theme = useTheme();
  const api = useApi(address);
  const chain = useChain(address);

  const displayUsernames = useCallback((usernames: string[]) => {
    const maxItems = 4;

    let displayArray = usernames.slice(0, maxItems).join(', ');

    if (usernames.length > maxItems) {
      displayArray += ', ...';
    }

    return displayArray;
  }, []);

  const Likes = () => {
    return (
      <Grid container item sx={{ pl: '25px' }}>
        <Grid item mr='15px'>
          <Infotip2 fontSize='12px' text={comment.comment_reactions['👍'].count ? displayUsernames(comment.comment_reactions['👍'].usernames) : ''}>
            <Grid alignItems='center' container item width='fit-content'>
              <ThumbUpIcon sx={{ color: 'secondary.contrastText', fontSize: '24px', pr: '5px' }} />
              <span style={{ color: theme.palette.secondary.contrastText, fontSize: '14px', fontWeight: 400 }}>{`(${comment.comment_reactions['👍'].count})`}</span>
            </Grid>
          </Infotip2>
        </Grid>
        <Grid item>
          <Infotip2 fontSize='12px' text={comment.comment_reactions['👎'].count ? displayUsernames(comment.comment_reactions['👎'].usernames) : ''}>
            <Grid alignItems='center' container item width='fit-content'>
              <ThumbDownIcon sx={{ color: 'secondary.contrastText', fontSize: '24px', pr: '5px' }} />
              <span style={{ color: theme.palette.secondary.contrastText, fontSize: '14px', fontWeight: 400 }}>{`(${comment.comment_reactions['👎'].count})`}</span>
            </Grid>
          </Infotip2>
        </Grid>
      </Grid>
    );
  };

  return (
    <Grid alignItems='center' container item sx={{ mb: '10px' }}>
      <Grid item maxWidth='65%' width='fit-content'>
        <Identity address={comment.proposer} api={api} chain={chain} identiconSize={25} showShortAddress showSocial={false} style={{ fontSize: '14px', fontWeight: 400, lineHeight: '47px', maxWidth: '100%', minWidth: '35%', width: 'fit-content' }} />
      </Grid>
      <Grid item sx={{ color: 'text.disabled', fontSize: '16px', px: '15px' }}>
        {formatRelativeTime(comment.created_at)}
      </Grid>
      {!noSource &&
        <Grid item>
          <Typography sx={{ border: `0.01px solid ${theme.palette.text.disabled}`, borderRadius: '30px', fontSize: '14px', fontWeight: 400, p: '0 10px', textAlign: 'center' }}>
            {'Polkassembly'}
          </Typography>
        </Grid>
      }
      <Grid item sx={{ pl: '25px' }} xs={12}>
        {comment?.content &&
          <ReactMarkdown
            components={{ img: ({ node, ...props }) => <img style={{ maxWidth: '100%' }} {...props} /> }}
            rehypePlugins={[rehypeRaw]}
          >
            {comment?.content}
          </ReactMarkdown>
        }
      </Grid>
      {comment?.comment_reactions &&
        <Likes />
      }
    </Grid>
  );
}
