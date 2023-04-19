// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Grid, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { useTranslation } from '../../../hooks';
import { ReferendumPolkassambly } from '../utils/types';
import CommentView from './Comment';
import Replies from './Replies';


export default function Comments({ address, referendum }: { address: string | undefined, referendum: ReferendumPolkassambly | undefined }): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (event, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  const sortedComments = useMemo(() => referendum?.comments?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)), [referendum]);

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
            <Grid container key={index} sx={{ borderBottom: `0.01px solid ${theme.palette.text.disabled}` }}>
              <CommentView address={address} comment={comment} />
              {!!comment?.replies?.length &&
                <Replies address={address} replies={comment?.replies} />
              }
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
