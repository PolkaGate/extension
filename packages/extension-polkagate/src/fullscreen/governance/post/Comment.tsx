// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { CommentType, Reply } from '../utils/types';

import { CallSplit as CallSplitIcon, ThumbDown as ThumbDownIcon, ThumbUp as ThumbUpIcon } from '@mui/icons-material';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

import { Identity, Infotip2 } from '../../../components';
import { useInfo, useTranslation } from '../../../hooks';
import { isValidAddress } from '../../../util/utils';
import { formatRelativeTime } from '../utils/util';

interface CommentProps {
  address: string | undefined;
  comment: CommentType | Reply;
  noSource?: boolean;
}

const displayUsernames = (usernames: string[]) => {
  const maxItems = 4;

  let displayArray = usernames.slice(0, maxItems).join(', ');

  if (usernames.length > maxItems) {
    displayArray += ', ...';
  }

  return displayArray;
};

const Reactions = ({ comment }: { comment: CommentType | Reply; }) => {
  const theme = useTheme();

  const backers =
    'comment_reactions' in comment && comment.comment_reactions['👍'].count
      ? displayUsernames(comment.comment_reactions['👍'].usernames ?? [])
      : 'reply_reactions' in comment && comment.reply_reactions['👍'].count
        ? displayUsernames(comment.reply_reactions['👍'].usernames ?? [])
        : '';

  const backersCount =
    'comment_reactions' in comment
      ? `(${comment.comment_reactions['👍'].count})`
      : 'reply_reactions' in comment
        ? `(${comment.reply_reactions['👍'].count})`
        : 0;

  const opposers =
    'comment_reactions' in comment && comment.comment_reactions['👎'].count
      ? displayUsernames(comment.comment_reactions['👎'].usernames ?? [])
      : 'reply_reactions' in comment && comment.reply_reactions['👎'].count
        ? displayUsernames(comment.reply_reactions['👎'].usernames ?? [])
        : '';

  const opposersCount =
    'comment_reactions' in comment
      ? `(${comment.comment_reactions['👎'].count})`
      : 'reply_reactions' in comment
        ? `(${comment.reply_reactions['👎'].count})`
        : 0;

  return (
    <Grid container item sx={{ pl: '25px' }}>
      <Grid item mr='15px'>
        <Infotip2 fontSize='12px' text={backers}>
          <Grid alignItems='center' container item width='fit-content'>
            <ThumbUpIcon sx={{ color: 'secondary.contrastText', fontSize: '24px', pr: '5px' }} />
            <span style={{ color: theme.palette.secondary.contrastText, fontSize: '14px', fontWeight: 400 }}>
              {backersCount}
            </span>
          </Grid>
        </Infotip2>
      </Grid>
      <Grid item>
        <Infotip2 fontSize='12px' text={opposers}>
          <Grid alignItems='center' container item width='fit-content'>
            <ThumbDownIcon sx={{ color: 'secondary.contrastText', fontSize: '24px', pr: '5px' }} />
            <span style={{ color: theme.palette.secondary.contrastText, fontSize: '14px', fontWeight: 400 }}>
              {opposersCount}
            </span>
          </Grid>
        </Infotip2>
      </Grid>
    </Grid>
  );
};

const VoteType = ({ comment }: { comment: CommentType | Reply; }) => {
  const { t } = useTranslation();

  const noVote = !('votes' in comment) || comment?.votes?.length === 0;
  const vote = 'votes' in comment && comment?.votes?.[0]?.decision;
  const voteColor =
    vote === 'yes'
      ? 'success.main'
      : vote === 'no'
        ? 'warning.main'
        : '#f89118';

  if (noVote) {
    return <></>;
  }

  return (
    <Box alignItems='center' display='flex' sx={{ borderBottom: '2px solid', borderBottomColor: voteColor, color: voteColor, ml: '10px' }}>
      {vote === 'yes' &&
        <ThumbUpIcon fontSize='small' />
      }
      {vote === 'no' &&
        <ThumbDownIcon fontSize='small' />
      }
      {vote === 'abstain' &&
        <CallSplitIcon />
      }
      <Typography fontSize='14px' fontWeight={500} sx={{ marginLeft: '5px' }}>
        {vote === 'yes' && t('Voted Aye')}
        {vote === 'no' && t('Voted Nay')}
        {vote === 'abstain' && t('Voted Abstain')}
      </Typography>
    </Box>
  );
};

const EditedTag = ({ comment }: { comment: CommentType | Reply; }) => {
  const { t } = useTranslation();
  const isEdited = comment.created_at && comment.updated_at && new Date(comment.created_at).getTime() !== new Date(comment.updated_at).getTime();

  if (isEdited) {
    return (
      <Grid item ml='10px'>
        <Typography sx={{ color: 'text.disabled', fontSize: '14px', fontWeight: 400, p: '0 10px', textAlign: 'center' }}>
          {t('Edited')}
        </Typography>
      </Grid>
    );
  } else {
    return <></>;
  }
};

export default function Comment({ address, comment, noSource }: CommentProps): React.ReactElement {
  const theme = useTheme();
  const { api, chain } = useInfo(address);

  const hasReactions = useMemo(() => 'comment_reactions' in comment || 'reply_reactions' in comment, [comment]);
  const { commenterAddress, commenterFormattedAddress } = useMemo(() => {
    if (!comment.proposer || !isValidAddress(comment.proposer)) {
      return { commenterAddress: undefined, commenterFormattedAddress: undefined };
    }

    return noSource
      ? { commenterAddress: comment.proposer, commenterFormattedAddress: undefined } // noSource means it is from PA (Polkassembly) and it returns address as substrate format
      : { commenterAddress: undefined, commenterFormattedAddress: comment.proposer }; // means it is from SS (SubSquare) and it returns address as Polkadot/Kusama format
  }, [comment.proposer, noSource]);

  return (
    <Grid alignItems='center' container item sx={{ mb: '10px' }}>
      <Grid item maxWidth='50%' width='fit-content'>
        <Identity address={commenterAddress} api={api} chain={chain} formatted={commenterFormattedAddress} identiconSize={25} name={comment?.username ?? undefined} noIdenticon={!commenterAddress} showShortAddress showSocial={false} style={{ fontSize: '14px', fontWeight: 400, lineHeight: '47px', maxWidth: '100%', minWidth: '35%', width: 'fit-content' }} />
      </Grid>
      <Grid item width='fit-content'>
        <VoteType
          comment={comment}
        />
      </Grid>
      <Grid item sx={{ color: 'text.disabled', fontSize: '16px', px: '15px' }}>
        {formatRelativeTime(comment.created_at)}
      </Grid>
      {
        <Grid item>
          <Typography sx={{ border: `0.01px solid ${theme.palette.text.disabled}`, borderRadius: '30px', fontSize: '14px', fontWeight: 400, p: '0 10px', textAlign: 'center' }}>
            {noSource && 'Polkassembly'}
            {!noSource && 'SubSquare'}
          </Typography>
        </Grid>
      }
      <EditedTag comment={comment} />
      <Grid item sx={{ pl: '25px' }} xs={12}>
        {comment?.content &&
          <ReactMarkdown
            components={{ img: ({ node: _node, ...props }) => <img style={{ maxWidth: '100%' }} {...props} /> }}
            rehypePlugins={[rehypeRaw]}
          >
            {comment?.content}
          </ReactMarkdown>
        }
      </Grid>
      {hasReactions &&
        <Reactions
          comment={comment}
        />
      }
    </Grid>
  );
}
