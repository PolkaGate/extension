// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Button, Grid, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { useChain, useChainName, useTranslation } from '../../../hooks';
import { ReferendumPolkassembly } from '../utils/types';
import CommentView from './Comment';
import Replies from './Replies';

export default function Comments({ address, referendum }: { address: string | undefined, referendum: ReferendumPolkassembly | undefined }): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const ChainName = useChainName(address);
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (event, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  const sortedComments = useMemo(() => referendum?.comments?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)), [referendum]);

  function openPolkassembly() {
    window.open(`https://${ChainName}.polkassembly.io/referenda/${referendum?.post_id}`, '_blank');
  }

  function openSubsquare() {
    window.open(`https://${ChainName}.subsquare.io/referenda/referendum/${referendum?.post_id}`, '_blank');
  }

  console.log('sortedComments:', sortedComments);

  return (
    <Accordion expanded={expanded} onChange={handleChange} sx={{ width: 'inherit', px: '16px', my: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: `${theme.palette.primary.main}`, fontSize: '37px' }} />} sx={{ borderBottom: expanded && `1px solid ${theme.palette.text.disabled}`, px: 0 }}>
        <Grid container item>
          <Grid container item xs={12}>
            <Typography fontSize={24} fontWeight={500}>
              {t('Comments')}
            </Typography>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0 }}>
        <Grid container item xs={12}>
          {sortedComments?.map((comment, index) => (
            <Grid container key={index} sx={{ borderBottom: index !== sortedComments.length - 1 && `0.01px solid ${theme.palette.text.disabled}` }}>
              <CommentView address={address} comment={comment} />
              {!!comment?.replies?.length &&
                <Replies address={address} replies={comment?.replies} />
              }
            </Grid>
          ))}
          <Grid container item justifyContent='flex-end' spacing={5} sx={{ pt: '30px' }}>
            <Grid item>
              <Button onClick={openPolkassembly} sx={{
                textTransform: 'none', borderColor: `${theme.palette.text.primary}`
              }} variant='outlined'>
                {'Comment on Polkassembly'}
              </Button>
            </Grid>
            <Grid item>
              <Button onClick={openSubsquare} sx={{ borderColor: `${theme.palette.text.primary}`, textTransform: 'none' }} variant='outlined'>
                {'Comment on Subsquare'}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
